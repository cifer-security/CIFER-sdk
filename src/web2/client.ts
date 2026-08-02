/**
 * @module web2/client
 * @description Web2 client factory with auto-stored session
 *
 * Provides a `createClient()` factory that wraps the stateless Web2 functions
 * with a stored session, blackboxUrl, and readClient so developers don't need
 * to pass them on every call.
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 *
 * const client = web2.createClient({
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 *   readClient: sdk.readClient,
 * });
 *
 * // Session is auto-stored after creation
 * await client.createManagedSession({
 *   principalId: 'your-uuid',
 *   ed25519Signer: myEd25519Signer,
 * });
 *
 * // No need to pass session or blackboxUrl!
 * const secret = await client.createSecret();
 * ```
 */

import type { ReadClient } from '../types/adapters.js';
import type {
  Web2Session,
  UseExistingSessionKeyParams,
  CreateWeb2SecretResult,
  ListWeb2SecretsResult,
  SetWeb2DelegateResult,
  RequestPermitResult,
  RequestRotatePermitParams,
  RequestTransferOrDelegatePermitParams,
  PrincipalByEmailResult,
  Ed25519Signer,
} from '../types/web2.js';
import type { DataConsumption, JobInfo, OutputFormat, InputFormat } from '../types/common.js';
import type { EncryptPayloadResult, DecryptPayloadResult } from '../blackbox/payload.js';
import type { FileJobResult } from '../blackbox/files.js';
import type { ListJobsResult } from '../blackbox/jobs.js';

import { createManagedSession, useExistingSessionKey } from './session.js';
import { createSecret, listSecrets } from './secret.js';
import { setDelegate } from './delegate.js';
import { requestPermit } from './permit.js';
import { getByEmail } from './principal.js';
import * as payloadModule from './blackbox/payload.js';
import * as filesModule from './blackbox/files.js';
import * as jobsModule from './blackbox/jobs.js';
import { Web2SessionError } from '../internal/errors/index.js';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for creating a Web2 client.
 *
 * @public
 */
export interface Web2ClientConfig {
  /** Blackbox URL (e.g. 'https://blackbox.cifersecurity.com:3010') */
  blackboxUrl: string;
  /** Read client for encrypt/decrypt operations (optional, can be passed per-call) */
  readClient?: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

// ============================================================================
// Client Interface
// ============================================================================

/**
 * Web2 client with auto-stored session and defaults.
 *
 * @remarks
 * Created via {@link createClient}. Wraps the stateless `web2.*` functions
 * with stored `session`, `blackboxUrl`, and `readClient` so you don't need
 * to pass them on every call.
 *
 * After calling `createManagedSession()` or `useExistingSessionKey()`,
 * the session is stored internally and used for all subsequent operations.
 * You can still override any default per-call.
 *
 * @example
 * ```typescript
 * const client = web2.createClient({ blackboxUrl, readClient });
 *
 * await client.createManagedSession({ principalId, ed25519Signer });
 *
 * const secret = await client.createSecret();
 * const encrypted = await client.payload.encryptPayload({
 *   secretId: secret.secretId,
 *   plaintext: 'Hello!',
 * });
 * ```
 *
 * @public
 */
export interface Web2Client {
  /** The currently stored session (null if no session has been created yet) */
  readonly session: Web2Session | null;
  /** The configured blackbox URL */
  readonly blackboxUrl: string;
  /** The configured read client (may be undefined) */
  readonly readClient: ReadClient | undefined;

  // --------------------------------------------------------------------------
  // Session Management
  // --------------------------------------------------------------------------

  /**
   * Create a managed session and store it in the client.
   *
   * The `blackboxUrl` is automatically filled from the client config.
   *
   * @param params - Session parameters (blackboxUrl is optional, defaults to client config)
   * @returns The created Web2Session (also stored internally)
   */
  createManagedSession(params: {
    principalId: string;
    ed25519Signer: Ed25519Signer;
    ttl?: number;
    blackboxUrl?: string;
    fetch?: typeof fetch;
  }): Promise<Web2Session>;

  /**
   * Use an existing session key and store it in the client.
   *
   * @param params - Existing session key parameters
   * @returns The Web2Session (also stored internally)
   */
  useExistingSessionKey(params: UseExistingSessionKeyParams): Web2Session;

  /**
   * Manually set or replace the stored session.
   *
   * @param session - The session to store
   */
  setSession(session: Web2Session): void;

  // --------------------------------------------------------------------------
  // Secret
  // --------------------------------------------------------------------------

  /**
   * Create a new Web2 secret.
   *
   * Uses the stored session and blackboxUrl unless overridden.
   */
  createSecret(params?: {
    session?: Web2Session;
    blackboxUrl?: string;
    fetch?: typeof fetch;
  }): Promise<CreateWeb2SecretResult>;

  /**
   * List all Web2 secrets for the current principal.
   *
   * Uses the stored session and blackboxUrl unless overridden.
   */
  listSecrets(params?: {
    session?: Web2Session;
    blackboxUrl?: string;
    fetch?: typeof fetch;
  }): Promise<ListWeb2SecretsResult>;

  // --------------------------------------------------------------------------
  // Delegate
  // --------------------------------------------------------------------------

  /**
   * Set or remove a delegate for a Web2 secret.
   *
   * Uses the stored session and blackboxUrl unless overridden.
   */
  setDelegate(params: {
    secretId: number | bigint;
    delegatePrincipalId: string;
    session?: Web2Session;
    blackboxUrl?: string;
    fetch?: typeof fetch;
  }): Promise<SetWeb2DelegateResult>;

  // --------------------------------------------------------------------------
  // Permit
  // --------------------------------------------------------------------------

  /**
   * Request a permit (rotate, transfer, or delegate).
   *
   * For transfer/delegate permits, uses the stored session unless overridden.
   * For rotate permits, no session is needed (uses email+password).
   */
  requestPermit(params:
    | (Omit<RequestRotatePermitParams, 'blackboxUrl'> & { blackboxUrl?: string })
    | (Omit<RequestTransferOrDelegatePermitParams, 'session' | 'blackboxUrl'> & { session?: Web2Session; blackboxUrl?: string })
  ): Promise<RequestPermitResult>;

  // --------------------------------------------------------------------------
  // Principal
  // --------------------------------------------------------------------------

  /**
   * Look up a principal by email address.
   *
   * Uses the stored blackboxUrl unless overridden.
   */
  getByEmail(email: string, blackboxUrl?: string, options?: { fetch?: typeof fetch }): Promise<PrincipalByEmailResult>;

  // --------------------------------------------------------------------------
  // Payload (blackbox wrappers)
  // --------------------------------------------------------------------------

  payload: {
    /**
     * Encrypt a payload using the stored session.
     */
    encryptPayload(params: {
      secretId: bigint | number;
      plaintext: string;
      outputFormat?: OutputFormat;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<EncryptPayloadResult>;

    /**
     * Decrypt a payload using the stored session.
     */
    decryptPayload(params: {
      secretId: bigint | number;
      encryptedMessage: string;
      cifer: string;
      inputFormat?: InputFormat;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<DecryptPayloadResult>;
  };

  // --------------------------------------------------------------------------
  // Files (blackbox wrappers)
  // --------------------------------------------------------------------------

  files: {
    /**
     * Encrypt a file using the stored session.
     */
    encryptFile(params: {
      secretId: bigint | number;
      file: File | Blob;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<FileJobResult>;

    /**
     * Decrypt a file using the stored session.
     */
    decryptFile(params: {
      secretId: bigint | number;
      file: File | Blob;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<FileJobResult>;

    /**
     * Decrypt an existing file using the stored session.
     */
    decryptExistingFile(params: {
      secretId: bigint | number;
      encryptJobId: string;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<FileJobResult>;
  };

  // --------------------------------------------------------------------------
  // Jobs (blackbox wrappers)
  // --------------------------------------------------------------------------

  jobs: {
    /**
     * Get job status (no session needed).
     */
    getStatus(jobId: string, blackboxUrl?: string, options?: { fetch?: typeof fetch }): Promise<JobInfo>;

    /**
     * Poll until a job completes (no session needed).
     */
    pollUntilComplete(
      jobId: string,
      blackboxUrl?: string,
      options?: { intervalMs?: number; maxAttempts?: number; onProgress?: (job: JobInfo) => void; fetch?: typeof fetch },
    ): Promise<JobInfo>;

    /**
     * Download a completed job (session needed for decrypt jobs).
     */
    download(jobId: string, params: {
      secretId: bigint | number;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<Blob>;

    /**
     * Delete a job (session needed).
     */
    deleteJob(jobId: string, params: {
      secretId: bigint | number;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<void>;

    /**
     * List all jobs (session needed).
     */
    list(params?: {
      includeExpired?: boolean;
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<ListJobsResult>;

    /**
     * Get data consumption statistics (session needed).
     */
    dataConsumption(params?: {
      session?: Web2Session;
      blackboxUrl?: string;
      readClient?: ReadClient;
      fetch?: typeof fetch;
    }): Promise<DataConsumption>;
  };
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a Web2 client with auto-stored session and defaults.
 *
 * @remarks
 * The client wraps all `web2.*` functions, storing `session`, `blackboxUrl`,
 * and `readClient` internally. After creating a session via
 * `createManagedSession()` or `useExistingSessionKey()`, all subsequent
 * calls automatically use the stored session.
 *
 * The existing stateless `web2.*` functions remain available for advanced
 * use cases that need explicit parameter passing.
 *
 * @param config - Client configuration
 * @returns A configured Web2Client instance
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 *
 * const client = web2.createClient({
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 *   readClient: sdk.readClient,
 * });
 *
 * // Session is auto-stored
 * await client.createManagedSession({
 *   principalId: reg.principalId,
 *   ed25519Signer,
 * });
 *
 * // No session or blackboxUrl needed!
 * const secret = await client.createSecret();
 *
 * const encrypted = await client.payload.encryptPayload({
 *   secretId: secret.secretId,
 *   plaintext: 'Hello Web2!',
 * });
 * ```
 *
 * @public
 */
export function createClient(config: Web2ClientConfig): Web2Client {
  let storedSession: Web2Session | null = null;
  const { blackboxUrl } = config;

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------

  function requireSession(override?: Web2Session): Web2Session {
    const session = override ?? storedSession;
    if (!session) {
      throw new Web2SessionError(
        'No active Web2 session. Call createManagedSession() or useExistingSessionKey() first, ' +
        'or pass session explicitly.'
      );
    }
    return session;
  }

  function requireReadClient(override?: ReadClient): ReadClient {
    const rc = override ?? config.readClient;
    if (!rc) {
      throw new Web2SessionError(
        'No readClient configured. Pass readClient to createClient() or provide it per-call.'
      );
    }
    return rc;
  }

  function resolveBlackboxUrl(override?: string): string {
    return override ?? blackboxUrl;
  }

  function resolveFetch(override?: typeof fetch): typeof fetch | undefined {
    return override ?? config.fetch;
  }

  // --------------------------------------------------------------------------
  // Build the client
  // --------------------------------------------------------------------------

  const client: Web2Client = {
    get session() {
      return storedSession;
    },
    get blackboxUrl() {
      return blackboxUrl;
    },
    get readClient() {
      return config.readClient;
    },

    // -- Session --

    async createManagedSession(params) {
      const session = await createManagedSession({
        principalId: params.principalId,
        ed25519Signer: params.ed25519Signer,
        blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
        ttl: params.ttl,
        fetch: resolveFetch(params.fetch),
      });
      storedSession = session;
      return session;
    },

    useExistingSessionKey(params) {
      const session = useExistingSessionKey(params);
      storedSession = session;
      return session;
    },

    setSession(session) {
      storedSession = session;
    },

    // -- Secret --

    async createSecret(params) {
      return createSecret({
        session: requireSession(params?.session),
        blackboxUrl: resolveBlackboxUrl(params?.blackboxUrl),
        fetch: resolveFetch(params?.fetch),
      });
    },

    async listSecrets(params) {
      return listSecrets({
        session: requireSession(params?.session),
        blackboxUrl: resolveBlackboxUrl(params?.blackboxUrl),
        fetch: resolveFetch(params?.fetch),
      });
    },

    // -- Delegate --

    async setDelegate(params) {
      return setDelegate({
        session: requireSession(params.session),
        secretId: params.secretId,
        delegatePrincipalId: params.delegatePrincipalId,
        blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
        fetch: resolveFetch(params.fetch),
      });
    },

    // -- Permit --

    async requestPermit(params) {
      if (params.action === 'rotate') {
        return requestPermit({
          action: 'rotate',
          email: (params as RequestRotatePermitParams).email,
          password: (params as RequestRotatePermitParams).password,
          payload: (params as RequestRotatePermitParams).payload,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          fetch: resolveFetch(params.fetch),
        });
      }

      // Transfer or delegate
      const transferParams = params as Omit<RequestTransferOrDelegatePermitParams, 'session' | 'blackboxUrl'> & { session?: Web2Session; blackboxUrl?: string };
      return requestPermit({
        action: transferParams.action,
        session: requireSession(transferParams.session),
        secretId: transferParams.secretId,
        payload: transferParams.payload,
        blackboxUrl: resolveBlackboxUrl(transferParams.blackboxUrl),
        fetch: resolveFetch(transferParams.fetch),
      });
    },

    // -- Principal --

    async getByEmail(email, bbUrl, options) {
      return getByEmail(email, resolveBlackboxUrl(bbUrl), {
        fetch: resolveFetch(options?.fetch),
      });
    },

    // -- Payload --

    payload: {
      async encryptPayload(params) {
        return payloadModule.encryptPayload({
          session: requireSession(params.session),
          secretId: params.secretId,
          plaintext: params.plaintext,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          readClient: requireReadClient(params.readClient),
          outputFormat: params.outputFormat,
          fetch: resolveFetch(params.fetch),
        });
      },

      async decryptPayload(params) {
        return payloadModule.decryptPayload({
          session: requireSession(params.session),
          secretId: params.secretId,
          encryptedMessage: params.encryptedMessage,
          cifer: params.cifer,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          readClient: requireReadClient(params.readClient),
          inputFormat: params.inputFormat,
          fetch: resolveFetch(params.fetch),
        });
      },
    },

    // -- Files --

    files: {
      async encryptFile(params) {
        return filesModule.encryptFile({
          session: requireSession(params.session),
          secretId: params.secretId,
          file: params.file,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          readClient: requireReadClient(params.readClient),
          fetch: resolveFetch(params.fetch),
        });
      },

      async decryptFile(params) {
        return filesModule.decryptFile({
          session: requireSession(params.session),
          secretId: params.secretId,
          file: params.file,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          readClient: requireReadClient(params.readClient),
          fetch: resolveFetch(params.fetch),
        });
      },

      async decryptExistingFile(params) {
        return filesModule.decryptExistingFile({
          session: requireSession(params.session),
          secretId: params.secretId,
          encryptJobId: params.encryptJobId,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          readClient: requireReadClient(params.readClient),
          fetch: resolveFetch(params.fetch),
        });
      },
    },

    // -- Jobs --

    jobs: {
      async getStatus(jobId, bbUrl, options) {
        return jobsModule.getStatus(jobId, resolveBlackboxUrl(bbUrl), {
          fetch: resolveFetch(options?.fetch),
        });
      },

      async pollUntilComplete(jobId, bbUrl, options) {
        return jobsModule.pollUntilComplete(jobId, resolveBlackboxUrl(bbUrl), {
          intervalMs: options?.intervalMs,
          maxAttempts: options?.maxAttempts,
          onProgress: options?.onProgress,
          fetch: resolveFetch(options?.fetch),
        });
      },

      async download(jobId, params) {
        return jobsModule.download(jobId, {
          session: requireSession(params.session),
          secretId: params.secretId,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          readClient: requireReadClient(params.readClient),
          fetch: resolveFetch(params.fetch),
        });
      },

      async deleteJob(jobId, params) {
        return jobsModule.deleteJob(jobId, {
          session: requireSession(params.session),
          secretId: params.secretId,
          blackboxUrl: resolveBlackboxUrl(params.blackboxUrl),
          readClient: requireReadClient(params.readClient),
          fetch: resolveFetch(params.fetch),
        });
      },

      async list(params) {
        return jobsModule.list({
          session: requireSession(params?.session),
          blackboxUrl: resolveBlackboxUrl(params?.blackboxUrl),
          readClient: requireReadClient(params?.readClient),
          includeExpired: params?.includeExpired,
          fetch: resolveFetch(params?.fetch),
        });
      },

      async dataConsumption(params) {
        return jobsModule.dataConsumption({
          session: requireSession(params?.session),
          blackboxUrl: resolveBlackboxUrl(params?.blackboxUrl),
          readClient: requireReadClient(params?.readClient),
          fetch: resolveFetch(params?.fetch),
        });
      },
    },
  };

  return client;
}
