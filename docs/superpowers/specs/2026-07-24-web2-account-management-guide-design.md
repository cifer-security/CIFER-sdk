# Web2 Account Management Guide Design

## Goal

Turn the existing Web2 authentication and session guide into the account-management guide, and document the complete OTP-gated Web2 account-deletion flow on that page.

## Scope

- Keep the existing file and public route: `docs-site/docs/guides/web2/authentication.md` and `/docs/guides/web2/authentication`.
- Change the guide's visible title from **Authentication & Sessions** to **Account Management**.
- Retain the existing registration, credential verification, password reset, Ed25519, and session-management content.
- Add an **Account Deletion** section after password reset.
- Update human-visible link labels elsewhere in the documentation from **Authentication & Sessions** to **Account Management** when they refer to this guide.
- Keep the existing Web2 Guides sidebar entry; do not add a separate account-deletion page or sidebar item.

The `generate-llm-txt.js` script is explicitly out of scope and will be handled separately.

## Account-Deletion Content

The new section will:

1. Explain that deletion is a two-step, OTP-confirmed flow.
2. Show `web2.auth.requestAccountDeletion()` with `email`, `password`, `principalId`, and `blackboxUrl`.
3. Explain the anti-enumeration response: the request returns a generic success message, while an OTP is sent only when the supplied details match a verified, active account.
4. Show `web2.auth.confirmAccountDeletion()` with `email`, `otp`, and `blackboxUrl`.
5. Explain that confirmation soft-deletes the account: it becomes dormant and is hidden from APIs, while later registration with the same email reactivates the same principal and restores access to its secrets.
6. State that these are stateless `web2.auth` functions rather than methods on `web2.createClient()`.

## Documentation Topology

The page path and sidebar configuration remain unchanged, preserving inbound links. References in concepts, quick start, and Web2 task guides will keep linking to `/docs/guides/web2/authentication`, but their visible guide name will be updated to **Account Management**.

Generic prose about authentication remains unchanged when it describes the authentication operation rather than the guide's title.

## Regression Coverage

A Vitest test will read the guide Markdown and verify that:

- its H1 is `# Account Management`;
- it contains an `## Account Deletion` section;
- it includes both `web2.auth.requestAccountDeletion()` and `web2.auth.confirmAccountDeletion()`.

The test must fail before the guide edit and pass afterward. Final verification will run the focused regression test and the Docusaurus build.

## Non-Goals

- No SDK runtime or type changes.
- No route or filename rename.
- No new sidebar item.
- No changes to generated API-reference structure.
- No changes to `scripts/generate-llm-txt.js` or `docs-site/static/llm.txt` for this task.
