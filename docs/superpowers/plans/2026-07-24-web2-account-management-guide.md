# Web2 Account Management Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the existing Web2 authentication/session guide to Account Management and document both OTP-gated account-deletion operations on it.

**Architecture:** Preserve the guide's file, route, and sidebar position. Enforce its required title and deletion API coverage with a small file-level Vitest regression test, then update the guide and the human-visible labels of links that point to it.

**Tech Stack:** Docusaurus Markdown, TypeScript, Vitest, Node.js filesystem APIs

## Global Constraints

- Keep `docs-site/docs/guides/web2/authentication.md` and `/docs/guides/web2/authentication` unchanged as the file and public route.
- Do not add a sidebar item or separate account-deletion page.
- Do not modify `scripts/generate-llm-txt.js` or intentionally regenerate `docs-site/static/llm.txt`.
- Do not change SDK runtime code or types.

---

### Task 1: Account Management Guide Contract and Content

**Files:**
- Create: `tests/web2-account-management-guide.test.ts`
- Modify: `docs-site/docs/guides/web2/authentication.md`
- Modify: `docs-site/docs/getting-started/concepts.md`
- Modify: `docs-site/docs/getting-started/quick-start-web2.md`
- Modify: `docs-site/docs/guides/web2/file-encryption.md`
- Modify: `docs-site/docs/guides/web2/text-encryption.md`
- Modify: `docs-site/docs/guides/web2/secret-management.md`

**Interfaces:**
- Consumes: The existing `/docs/guides/web2/authentication` route and the public `web2.auth.requestAccountDeletion()` and `web2.auth.confirmAccountDeletion()` SDK functions.
- Produces: An Account Management guide at the same route, with an `## Account Deletion` section and stable regression coverage.

- [ ] **Step 1: Write the failing guide contract test**

```typescript
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
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `npm test -- tests/web2-account-management-guide.test.ts`

Expected: FAIL because the current H1 is `Authentication & Sessions` and the guide contains no `Account Deletion` section.

- [ ] **Step 3: Rename and extend the guide**

Change the H1 to `# Account Management`, adjust the opening sentence to cover the account lifecycle, and add this section immediately after `## Password Reset`:

````markdown
## Account Deletion

Account deletion is a two-step, OTP-confirmed operation. These calls use the stateless `web2.auth` API; they are not methods on the client returned by `web2.createClient()`.

### Step 1: Request a deletion OTP

```typescript
const deletionRequest = await web2.auth.requestAccountDeletion({
  email: 'user@example.com',
  password: 'securePassword123',
  principalId: 'your-principal-uuid',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

console.log(deletionRequest.message);
```

For anti-enumeration, the Blackbox returns a generic success message. It sends an OTP only when the email, password, and `principalId` match a verified, active account.

### Step 2: Confirm account deletion

```typescript
const deletionResult = await web2.auth.confirmAccountDeletion({
  email: 'user@example.com',
  otp: '123456',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

console.log('Deleted:', deletionResult.success);
```

Confirmation soft-deletes the account. The account becomes dormant and is hidden from APIs, but its records are retained for legal disclosure. Registering again with the same email reactivates the same `principalId`, including access to its existing secrets.
````

Add account deletion to the guide's opening description and Best Practices list. Change visible `Authentication & Sessions` link labels that target `/docs/guides/web2/authentication` to `Account Management` in the files listed above; retain generic authentication prose where it describes the operation rather than the guide title.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- tests/web2-account-management-guide.test.ts`

Expected: PASS with one passing test.

- [ ] **Step 5: Verify the documentation build**

Run: `npm --prefix docs-site run build`

Expected: Exit 0 and `Generated static files in "build".` Existing broken-anchor warnings may still be reported, but no new broken-link or compilation failure may be introduced.

- [ ] **Step 6: Review the scoped diff**

Run: `git diff --check && git diff -- tests/web2-account-management-guide.test.ts docs-site/docs/guides/web2/authentication.md docs-site/docs/getting-started/concepts.md docs-site/docs/getting-started/quick-start-web2.md docs-site/docs/guides/web2/file-encryption.md docs-site/docs/guides/web2/text-encryption.md docs-site/docs/guides/web2/secret-management.md`

Expected: No whitespace errors; the diff is limited to the regression test, guide title/content, and link-label updates described above.

- [ ] **Step 7: Commit**

```bash
git add tests/web2-account-management-guide.test.ts \
  docs-site/docs/guides/web2/authentication.md \
  docs-site/docs/getting-started/concepts.md \
  docs-site/docs/getting-started/quick-start-web2.md \
  docs-site/docs/guides/web2/file-encryption.md \
  docs-site/docs/guides/web2/text-encryption.md \
  docs-site/docs/guides/web2/secret-management.md
git commit -m "docs(web2): add account management deletion guide"
```
