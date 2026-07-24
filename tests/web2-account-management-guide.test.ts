import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const guidePath = fileURLToPath(
  new URL('../docs-site/docs/guides/web2/authentication.md', import.meta.url)
);

describe('Web2 account management guide', () => {
  it('documents the two-step account deletion flow', () => {
    const guide = readFileSync(guidePath, 'utf8');

    expect(guide).toMatch(/^# Account Management$/m);
    expect(guide).toMatch(/^## Account Deletion$/m);
    expect(guide).toContain('web2.auth.requestAccountDeletion()');
    expect(guide).toContain('web2.auth.confirmAccountDeletion()');
  });
});
