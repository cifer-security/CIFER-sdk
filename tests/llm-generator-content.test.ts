import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const generatorPath = fileURLToPath(
  new URL('../scripts/generate-llm-txt.js', import.meta.url)
);

const generator = readFileSync(generatorPath, 'utf8');

function extractSection(startMarker: string, endMarker: string): string {
  expect(generator.split(startMarker)).toHaveLength(2);
  expect(generator.split(endMarker)).toHaveLength(2);

  const start = generator.indexOf(startMarker);
  const end = generator.indexOf(endMarker, start + startMarker.length);

  expect(end).toBeGreaterThan(start);

  return generator.slice(start, end);
}

function extractDocumentedMethodBlock(
  signature: string,
  followingSignature: string
): string {
  const block = extractSection(signature, followingSignature);
  const separatorIndex = block.indexOf('\n\n${SUB_SEPARATOR}');

  expect(separatorIndex).toBeGreaterThan(0);

  return block.slice(0, separatorIndex);
}

describe('LLM documentation generator content', () => {
  it('documents the exact Base mainnet definition in the Thirdweb example', () => {
    const thirdwebSection = extractSection(
      '--- Thirdweb ---',
      '--- Private Key (Server-Side) ---'
    );

    expect(thirdwebSection).toContain(`const base = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
});

const wallet = createWallet('io.metamask');
await wallet.connect({ client: thirdwebClient, chain: base });`);

    expect(generator).not.toContain('752025');
    expect(generator).not.toMatch(/ternoa/i);
  });

  it('documents the complete Web2 account-deletion flow', () => {
    const requestBlock = extractDocumentedMethodBlock(
      'requestAccountDeletion(params): Promise<{ message: string }>',
      'confirmAccountDeletion(params): Promise<ConfirmAccountDeletionResult>'
    );
    const confirmBlock = extractDocumentedMethodBlock(
      'confirmAccountDeletion(params): Promise<ConfirmAccountDeletionResult>',
      'retryNodeRegistration(params): Promise<RetryNodeRegistrationResult>'
    );

    expect(requestBlock).toContain(`  Parameters:
    - email: string
    - password: string
    - principalId: string
    - blackboxUrl: string
    - fetch?: typeof fetch`);
    expect(requestBlock).toContain('  Returns: { message: string }');
    expect(requestBlock).toContain(
      'These calls are stateless web2.auth functions, not methods on web2.createClient().'
    );
    expect(requestBlock).toContain(
      'For anti-enumeration, the Blackbox returns a generic success message.'
    );

    expect(confirmBlock).toContain(`  Parameters:
    - email: string
    - otp: string
    - blackboxUrl: string
    - fetch?: typeof fetch`);
    expect(confirmBlock).toContain(
      '  Returns: { success: true, message: string }'
    );
    expect(confirmBlock).toContain(
      'Confirmation leaves the account soft-deleted (dormant) and hidden from APIs.'
    );
    expect(confirmBlock).toContain(
      'Re-registering the same email reactivates the same principalId and existing secrets.'
    );
    expect(confirmBlock).toContain(
      'Clear cached credentials, keys, and sessions after successful confirmation.'
    );
  });
});
