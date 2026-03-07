/**
 * @module web2/session
 * @description Web2 session management
 *
 * Provides two session modes:
 * - **Managed session**: SDK has Ed25519 key, can create and renew sessions
 * - **Existing session key**: SDK only has session EOA private key
 */

import type { Address } from '../types/common.js';
import type {
  CreateManagedSessionParams,
  CreateSessionResult,
  UseExistingSessionKeyParams,
  Web2Session,
  Ed25519Signer,
} from '../types/web2.js';
import { PrivateKeySignerAdapter } from '../internal/adapters/index.js';
import { Web2SessionError } from '../internal/errors/index.js';

// ============================================================================
// Internal helpers
// ============================================================================

function normalizeUrl(blackboxUrl: string): string {
  return blackboxUrl.replace(/\/$/, '');
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}

/** Default renewal skew: renew if expiring within this many milliseconds */
const RENEWAL_SKEW_MS = 60_000;

/**
 * Call POST /web2/session to create a session.
 */
async function callCreateSession(
  principalId: string,
  ed25519Signer: Ed25519Signer,
  sessionAddress: string,
  blackboxUrl: string,
  ttl?: number,
  fetchFn?: typeof fetch
): Promise<CreateSessionResult> {
  const useFetch = fetchFn ?? fetch;
  const url = `${normalizeUrl(blackboxUrl)}/web2/session`;

  const timestamp = Date.now().toString();

  // Build canonical message
  let message = `cifer_session:${principalId}:${timestamp}:${sessionAddress}`;
  if (ttl !== undefined) {
    message += `:${ttl}`;
  }

  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = await ed25519Signer.sign(messageBytes);
  const signatureHex = bytesToHex(signatureBytes);

  const body: Record<string, unknown> = {
    principalId,
    timestamp,
    signature: signatureHex,
    sessionAddress,
  };
  if (ttl !== undefined) {
    body.ttl = ttl;
  }

  const response = await useFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const msg =
      (errorBody.error as string) ||
      (errorBody.message as string) ||
      `Session creation failed with status ${response.status}`;
    throw new Web2SessionError(msg);
  }

  const result = (await response.json()) as {
    sessionToken: string;
    sessionAddress: string;
    quorumProof: Array<{ nodeAddress: string; signature: string }>;
    expiresAt: string;
  };

  return {
    sessionToken: result.sessionToken,
    sessionAddress: result.sessionAddress as Address,
    quorumProof: result.quorumProof,
    expiresAt: result.expiresAt,
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Create a managed Web2 session.
 *
 * Generates an ephemeral EOA keypair and uses the provided Ed25519 signer
 * to authenticate with the blackbox. The returned session supports
 * automatic renewal via `ensureValid()`.
 *
 * @param params - Session creation parameters
 * @returns A managed Web2Session
 *
 * @example
 * ```typescript
 * const session = await web2.session.createManagedSession({
 *   principalId: '550e8400-...',
 *   ed25519Signer: myEd25519Signer,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   ttl: 900000, // 15 minutes
 * });
 *
 * // Use the session for encryption
 * const encrypted = await web2.blackbox.payload.encryptPayload({
 *   session,
 *   secretId: 42,
 *   plaintext: 'Hello!',
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   readClient: sdk.readClient,
 * });
 * ```
 */
export async function createManagedSession(
  params: CreateManagedSessionParams
): Promise<Web2Session> {
  const { principalId, ed25519Signer, blackboxUrl, ttl } = params;
  const fetchFn = params.fetch;

  // Generate ephemeral EOA keypair
  const eoaSigner = PrivateKeySignerAdapter.generate();
  const sessionAddress = await eoaSigner.getAddress();

  // Create the session on the server
  const result = await callCreateSession(
    principalId,
    ed25519Signer,
    sessionAddress,
    blackboxUrl,
    ttl,
    fetchFn
  );

  // Mutable state
  let expiresAt = result.expiresAt;

  const session: Web2Session = {
    principalId,
    sessionAddress: result.sessionAddress,
    get expiresAt() {
      return expiresAt;
    },
    signer: eoaSigner,
    isManaged: true,

    async renew(): Promise<void> {
      // Generate a new EOA for the renewed session
      const newEoaSigner = PrivateKeySignerAdapter.generate();
      const newSessionAddress = await newEoaSigner.getAddress();

      const renewResult = await callCreateSession(
        principalId,
        ed25519Signer,
        newSessionAddress,
        blackboxUrl,
        ttl,
        fetchFn
      );

      // Update mutable state on the session object
      expiresAt = renewResult.expiresAt;

      // Replace the signer on the session object with the new one
      // We need to use Object.defineProperty since signer is readonly on the interface
      Object.defineProperty(session, 'signer', { value: newEoaSigner, writable: false, configurable: true });
      Object.defineProperty(session, 'sessionAddress', { value: renewResult.sessionAddress, writable: false, configurable: true });
    },

    async ensureValid(): Promise<void> {
      if (!expiresAt) return;

      const expiresAtMs = new Date(expiresAt).getTime();
      const now = Date.now();

      if (now >= expiresAtMs - RENEWAL_SKEW_MS) {
        await session.renew();
      }
    },
  };

  return session;
}

/**
 * Use an existing session key for Web2 authentication.
 *
 * This is the "advanced" mode for when a session was already created
 * externally (e.g. by a TEE web front). The SDK wraps the provided
 * private key in a signer but **cannot** create or renew sessions.
 *
 * @param params - Existing session key parameters
 * @returns A Web2Session (non-managed, cannot renew)
 *
 * @example
 * ```typescript
 * const session = web2.session.useExistingSessionKey({
 *   sessionPrivateKey: '0xabc123...',
 *   principalId: '550e8400-...', // optional
 * });
 *
 * // Use the session — but note it cannot be renewed
 * const encrypted = await web2.blackbox.payload.encryptPayload({
 *   session,
 *   secretId: 42,
 *   plaintext: 'Hello!',
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   readClient: sdk.readClient,
 * });
 * ```
 */
export function useExistingSessionKey(
  params: UseExistingSessionKeyParams
): Web2Session {
  const eoaSigner = new PrivateKeySignerAdapter(params.sessionPrivateKey);

  // We need to eagerly get the address — but getAddress is async.
  // We'll use a placeholder and fill it lazily.
  let cachedAddress: Address | null = null;

  const session: Web2Session = {
    principalId: params.principalId ?? '',

    get sessionAddress(): Address {
      if (cachedAddress) return cachedAddress;
      // Fallback: caller should await getAddress first if they need it
      return '0x0000000000000000000000000000000000000000' as Address;
    },

    expiresAt: '',
    signer: eoaSigner,
    isManaged: false,

    async renew(): Promise<void> {
      throw new Web2SessionError(
        'Cannot renew session: no Ed25519 signer available. ' +
        'This session was created with useExistingSessionKey(). ' +
        'The session must be recreated externally (e.g. via TEE web front).'
      );
    },

    async ensureValid(): Promise<void> {
      // Populate the cached address on first call
      if (!cachedAddress) {
        cachedAddress = await eoaSigner.getAddress();
        Object.defineProperty(session, 'sessionAddress', {
          value: cachedAddress,
          writable: false,
          configurable: true,
        });
      }
      // No-op: we can't check validity without a server call in this mode
    },
  };

  return session;
}
