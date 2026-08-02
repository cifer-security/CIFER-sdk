# LLM Generator Base and Account-Deletion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make future generated LLM documentation use Base mainnet examples and document the complete Web2 account-deletion flow.

**Architecture:** Keep the existing string-template generator structure. Add one source-level Vitest regression file, replace the obsolete chain example literals throughout the generator, and insert the account-deletion reference beside the existing password-management functions.

**Tech Stack:** Node.js ESM, JavaScript template literals, TypeScript, Vitest.

## Global Constraints

- Modify `scripts/generate-llm-txt.js` and the focused regression test only during implementation.
- Do not run the generator or modify `docs-site/static/llm.txt`.
- Use Base mainnet name `Base`, chain ID `8453`, and RPC URL `https://mainnet.base.org`.
- Remove all `752025`, `Ternoa`, `ternoa`, and `mainnet.ternoa.network` references from the generator.
- Preserve unrelated working-tree changes, including `docs-site/docs/changelog.md` and `docs-site/static/llm.txt`.

---

### Task 1: Replace Ternoa Chain Examples with Base Mainnet

**Files:**
- Create: `tests/llm-generator-content.test.ts`
- Modify: `scripts/generate-llm-txt.js:156-2275`
- Test: `tests/llm-generator-content.test.ts`

**Interfaces:**
- Consumes: the generator source as UTF-8 text.
- Produces: generator templates whose Web3 examples consistently use Base mainnet identifiers.

- [ ] **Step 1: Write the failing chain-content test**

Create `tests/llm-generator-content.test.ts` with:

```typescript
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const generatorPath = fileURLToPath(
  new URL('../scripts/generate-llm-txt.js', import.meta.url)
);

const generator = readFileSync(generatorPath, 'utf8');

describe('LLM documentation generator content', () => {
  it('uses Base mainnet for every chain-specific example', () => {
    expect(generator).toContain('chainId: 8453');
    expect(generator).toContain("name: 'Base'");
    expect(generator).toContain('https://mainnet.base.org');
    expect(generator).toContain('const base = defineChain({');
    expect(generator).toContain('chain: base');

    expect(generator).not.toContain('752025');
    expect(generator).not.toMatch(/ternoa/i);
  });
});
```

- [ ] **Step 2: Run the focused test and verify the RED state**

Run:

```bash
npx vitest run tests/llm-generator-content.test.ts
```

Expected: FAIL because the generator still contains `752025` and Ternoa examples and does not contain the Base chain definition.

- [ ] **Step 3: Replace the obsolete chain literals in the generator**

Apply these exact replacements throughout `scripts/generate-llm-txt.js`:

| Existing literal | Replacement |
|---|---|
| `752025` | `8453` |
| `Ternoa` | `Base` |
| `ternoa` | `base` |
| `https://mainnet.ternoa.network` | `https://mainnet.base.org` |

The order must replace the full RPC URL before replacing the lowercase chain name, so the output cannot become `https://mainnet.base.network`. The Thirdweb example must end with this structure:

```javascript
const base = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
});

await wallet.connect({ client: thirdwebClient, chain: base });
```

All other occurrences are numeric chain arguments or RPC configuration examples and receive the same exact literal replacement.

- [ ] **Step 4: Run the focused test and verify the GREEN state**

Run:

```bash
npx vitest run tests/llm-generator-content.test.ts
```

Expected: PASS with one test passing.

- [ ] **Step 5: Commit the Base migration**

```bash
git add tests/llm-generator-content.test.ts scripts/generate-llm-txt.js
git commit -m "docs: use base in llm generator examples"
```

---

### Task 2: Document Web2 Account Deletion

**Files:**
- Modify: `tests/llm-generator-content.test.ts`
- Modify: `scripts/generate-llm-txt.js:1364-1460`
- Test: `tests/llm-generator-content.test.ts`

**Interfaces:**
- Consumes: the existing `generateWeb2Reference()` template and public `web2.auth` API names.
- Produces: generated reference content for `requestAccountDeletion(params)` and `confirmAccountDeletion(params)`.

- [ ] **Step 1: Add the failing account-deletion content test**

Append this test inside the existing `describe` block:

```typescript
  it('documents the complete Web2 account-deletion flow', () => {
    expect(generator).toContain(
      'requestAccountDeletion(params): Promise<{ message: string }>'
    );
    expect(generator).toContain(
      'confirmAccountDeletion(params): Promise<ConfirmAccountDeletionResult>'
    );
    expect(generator).toContain('- principalId: string');
    expect(generator).toContain('generic success message');
    expect(generator).toContain('stateless web2.auth functions');
    expect(generator).toContain('soft-deleted (dormant)');
    expect(generator).toContain('same principalId and existing secrets');
    expect(generator).toContain('Clear cached credentials, keys, and sessions');
  });
```

- [ ] **Step 2: Run the focused test and verify the RED state**

Run:

```bash
npx vitest run tests/llm-generator-content.test.ts
```

Expected: the Base test passes and the account-deletion test fails because `requestAccountDeletion(params)` is absent.

- [ ] **Step 3: Insert the account-deletion reference after `resetPassword`**

Insert the following template content after the `resetPassword(params)` parameters and before `retryNodeRegistration(params)`:

```text
${SUB_SEPARATOR}

requestAccountDeletion(params): Promise<{ message: string }>
  Step 1 of account deletion: request a deletion-confirmation OTP.
  These calls are stateless web2.auth functions, not methods on web2.createClient().

  Parameters:
    - email: string
    - password: string
    - principalId: string
    - blackboxUrl: string
    - fetch?: typeof fetch

  Returns: { message: string }

  For anti-enumeration, the Blackbox returns a generic success message.
  An OTP is sent only when the email, password, and principalId match a
  verified, active account.

  Example:
    const deletionRequest = await web2.auth.requestAccountDeletion({
      email: 'user@example.com',
      password: 'securePassword123',
      principalId: 'your-principal-uuid',
      blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
    });

${SUB_SEPARATOR}

confirmAccountDeletion(params): Promise<ConfirmAccountDeletionResult>
  Step 2 of account deletion: confirm with the emailed OTP.

  Parameters:
    - email: string
    - otp: string
    - blackboxUrl: string
    - fetch?: typeof fetch

  Returns: { success: true, message: string }

  Confirmation leaves the account soft-deleted (dormant) and hidden from APIs.
  Re-registering the same email reactivates the same principalId and existing secrets.
  Clear cached credentials, keys, and sessions after successful confirmation.

  Example:
    const deletionResult = await web2.auth.confirmAccountDeletion({
      email: 'user@example.com',
      otp: '123456',
      blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
    });
```

- [ ] **Step 4: Run the focused test and verify the GREEN state**

Run:

```bash
npx vitest run tests/llm-generator-content.test.ts
```

Expected: PASS with two tests passing.

- [ ] **Step 5: Commit the account-deletion reference**

```bash
git add tests/llm-generator-content.test.ts scripts/generate-llm-txt.js
git commit -m "docs: add account deletion to llm generator"
```

---

### Task 3: Verify the Complete Change Without Regenerating Output

**Files:**
- Verify: `scripts/generate-llm-txt.js`
- Verify: `tests/llm-generator-content.test.ts`
- Preserve: `docs-site/static/llm.txt`

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: verification evidence that the generator meets the spec and the user's generated output remains untouched.

- [ ] **Step 1: Run the focused regression test**

```bash
npx vitest run tests/llm-generator-content.test.ts
```

Expected: two tests pass with zero failures.

- [ ] **Step 2: Run the complete test suite**

```bash
npm test
```

Expected: all Vitest files and tests pass with zero failures.

- [ ] **Step 3: Check literal migration and patch formatting**

```bash
rg -n -i '752025|ternoa|mainnet\.ternoa\.network' scripts/generate-llm-txt.js
git diff --check
```

Expected: `rg` prints no matches and exits with status 1; `git diff --check` prints no errors and exits with status 0.

- [ ] **Step 4: Confirm generated output was not changed by this implementation**

```bash
git diff -- docs-site/static/llm.txt
```

Expected: the diff remains limited to the user's pre-existing generated timestamp and version change; no Base or account-deletion content appears because the generator was not run.

- [ ] **Step 5: Review final scope**

```bash
git status --short
git log -3 --oneline
```

Expected: implementation commits contain only the generator and focused test; the user's unstaged changelog and `llm.txt` changes remain present and uncommitted.
