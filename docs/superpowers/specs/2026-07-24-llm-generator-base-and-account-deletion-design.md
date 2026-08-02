# LLM Generator Base and Account-Deletion Update Design

## Goal

Update `scripts/generate-llm-txt.js` so future generated LLM documentation describes Base mainnet instead of Ternoa and includes the Web2 account-deletion feature.

## Scope

- Replace every Ternoa chain example in the generator with Base mainnet:
  - chain name: `Base`;
  - chain ID: `8453`;
  - public RPC URL: `https://mainnet.base.org`;
  - example variable names such as `ternoa` become `base`.
- Replace every example chain ID `752025` in the generator with `8453`, including quick starts, SDK initialization, wallet integrations, namespace references, commitments, flows, error-handling examples, and complete examples.
- Extend the `web2.auth` reference with the two-step account-deletion flow.
- Do not run the generator or modify `docs-site/static/llm.txt`.
- Preserve all unrelated working-tree changes.

## Web2 Account-Deletion Content

The generated reference will document:

1. `web2.auth.requestAccountDeletion()` with `email`, `password`, `principalId`, and `blackboxUrl`.
2. The generic anti-enumeration response and the requirement that account details match a verified, active account before an OTP is sent.
3. `web2.auth.confirmAccountDeletion()` with `email`, `otp`, and `blackboxUrl`.
4. The `{ success, message }` result.
5. Soft-deletion semantics: the account becomes dormant and hidden from APIs, while re-registering the same email reactivates the same principal and restores access to existing secrets.
6. Guidance to clear cached credentials, keys, and sessions after successful confirmation.
7. The fact that these are stateless `web2.auth` functions, not `web2.createClient()` methods.

## Implementation Approach

Use targeted edits in the existing generator templates. This keeps the script's current structure and avoids introducing shared constants or broader refactoring solely for documentation examples.

## Regression Coverage

Add a focused Vitest test that reads `scripts/generate-llm-txt.js` and verifies:

- the two account-deletion function names and required behavior are documented;
- Base mainnet identifiers are present;
- `752025`, `Ternoa`, and `mainnet.ternoa.network` are absent.

The test will be run before the implementation to confirm it fails for the missing behavior, then again after the edit. Final verification will also confirm that `docs-site/static/llm.txt` retains its pre-existing content and is not regenerated.

## Non-Goals

- No changes to SDK runtime behavior or public types.
- No edits to the hand-written docs-site guides or API reference.
- No generated `llm.txt` update.
- No chain-example refactor outside `scripts/generate-llm-txt.js`.
