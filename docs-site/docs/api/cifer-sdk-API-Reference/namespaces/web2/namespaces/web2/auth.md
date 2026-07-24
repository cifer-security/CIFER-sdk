[**cifer-sdk API Reference v0.5.2**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/auth

# web2/auth

## Description

Web2 authentication and registration endpoints

Provides functions for the two-phase registration flow:
- Phase 1: Email + password registration with OTP verification
- Phase 2: Ed25519 key registration propagated to cluster nodes

Also includes password reset and OTP resend helpers.

## Functions

### register()

> **register**(`params`): `Promise`\<[`RegisterResult`](../../../../../index.md#registerresult)\>

Defined in: [web2/auth.ts:84](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L84)

Register a new Web2 principal with email and password.

Sends an OTP to the provided email address for verification.

#### Parameters

##### params

[`RegisterParams`](../../../../../index.md#registerparams)

Registration parameters

#### Returns

`Promise`\<[`RegisterResult`](../../../../../index.md#registerresult)\>

The assigned principalId and server message

#### Example

```typescript
const result = await web2.auth.register({
  email: 'user@example.com',
  password: 'securePassword123',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
console.log('Principal ID:', result.principalId);
// Now check email for OTP and call verifyEmail()
```

***

### verifyEmail()

> **verifyEmail**(`params`): `Promise`\<[`VerifyEmailResult`](../../../../../index.md#verifyemailresult)\>

Defined in: [web2/auth.ts:130](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L130)

Verify the email OTP sent during registration.

#### Parameters

##### params

[`VerifyEmailParams`](../../../../../index.md#verifyemailparams)

Verification parameters

#### Returns

`Promise`\<[`VerifyEmailResult`](../../../../../index.md#verifyemailresult)\>

The principalId and verification status

#### Example

```typescript
const result = await web2.auth.verifyEmail({
  email: 'user@example.com',
  otp: '123456',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
console.log('Verified:', result.emailVerified);
```

***

### registerKey()

> **registerKey**(`params`): `Promise`\<[`RegisterKeyResult`](../../../../../index.md#registerkeyresult)\>

Defined in: [web2/auth.ts:187](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L187)

Register an Ed25519 public key and propagate the principal to cluster nodes.

This is Phase 2 of the registration flow. Requires a verified email
and valid password.

#### Parameters

##### params

[`RegisterKeyParams`](../../../../../index.md#registerkeyparams)

Key registration parameters

#### Returns

`Promise`\<[`RegisterKeyResult`](../../../../../index.md#registerkeyresult)\>

Registration result including node propagation status

#### Example

```typescript
const result = await web2.auth.registerKey({
  principalId: '550e8400-...',
  password: 'securePassword123',
  ed25519Signer: myEd25519Signer,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

if (result.nodeRegistrationStatus !== 'complete') {
  // Retry failed nodes
  await web2.auth.retryNodeRegistration({
    principalId: result.principalId,
    blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  });
}
```

***

### resendOtp()

> **resendOtp**(`params`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [web2/auth.ts:243](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L243)

Resend the email verification OTP.

Has a 60-second cooldown between requests.

#### Parameters

##### params

[`ResendOtpParams`](../../../../../index.md#resendotpparams)

Resend parameters

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

Server message

***

### forgotPassword()

> **forgotPassword**(`params`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [web2/auth.ts:271](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L271)

Send a password-reset OTP to a verified email.

Has a 60-second cooldown between requests.

#### Parameters

##### params

[`ForgotPasswordParams`](../../../../../index.md#forgotpasswordparams)

Forgot password parameters

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

Server message

***

### resetPassword()

> **resetPassword**(`params`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [web2/auth.ts:297](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L297)

Reset a password using the OTP from forgotPassword.

#### Parameters

##### params

[`ResetPasswordParams`](../../../../../index.md#resetpasswordparams)

Reset password parameters

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

Server message

***

### verifyCredentials()

> **verifyCredentials**(`params`): `Promise`\<[`VerifyCredentialsResult`](../../../../../index.md#verifycredentialsresult)\>

Defined in: [web2/auth.ts:346](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L346)

Verify Web2 email + password credentials against the Blackbox principal store.

**Web2 only** (`chainId = -1`). This function is not available for Web3
wallet users. It validates credentials only — it does **not** create a
session or return session tokens.

Use this when another system needs to confirm that a user entered the
correct email and password before proceeding (e.g. app unlock, key rotation).

#### Parameters

##### params

[`VerifyCredentialsParams`](../../../../../index.md#verifycredentialsparams)

Verification parameters

#### Returns

`Promise`\<[`VerifyCredentialsResult`](../../../../../index.md#verifycredentialsresult)\>

`{ valid: true, principalId }` on success

#### Throws

[Web2AuthError](../../../../../index.md#web2autherror) on invalid credentials (401/403/404)

#### Example

```typescript
// Web2 only — not for Web3 wallet users
const result = await web2.auth.verifyCredentials({
  email: 'user@example.com',
  password: 'securePassword123',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
console.log('Principal ID:', result.principalId);
```

***

### requestAccountDeletion()

> **requestAccountDeletion**(`params`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [web2/auth.ts:388](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L388)

Step 1 of account deletion: request a deletion-confirmation OTP.

Requires the account email, password, and the principalId issued at
registration. For anti-enumeration the Black Box always responds with a
generic success message; an OTP is only emailed when all details match a
verified, active account. Does not throw on "no such account".

#### Parameters

##### params

[`RequestAccountDeletionParams`](../../../../../index.md#requestaccountdeletionparams)

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### confirmAccountDeletion()

> **confirmAccountDeletion**(`params`): `Promise`\<[`ConfirmAccountDeletionResult`](../../../../../index.md#confirmaccountdeletionresult)\>

Defined in: [web2/auth.ts:418](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L418)

Step 2 of account deletion: confirm with the emailed OTP. On success the
account is soft-deleted (dormant): hidden from all APIs but retained for
legal disclosure. Re-registering later with the same email reactivates the
same principalId (old secrets return).

#### Parameters

##### params

[`ConfirmAccountDeletionParams`](../../../../../index.md#confirmaccountdeletionparams)

#### Returns

`Promise`\<[`ConfirmAccountDeletionResult`](../../../../../index.md#confirmaccountdeletionresult)\>

***

### retryNodeRegistration()

> **retryNodeRegistration**(`params`): `Promise`\<[`RetryNodeRegistrationResult`](../../../../../index.md#retrynoderegistrationresult)\>

Defined in: [web2/auth.ts:448](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L448)

Retry node registration for a principal whose initial registration
was partial or pending.

#### Parameters

##### params

[`RetryNodeRegistrationParams`](../../../../../index.md#retrynoderegistrationparams)

Retry parameters

#### Returns

`Promise`\<[`RetryNodeRegistrationResult`](../../../../../index.md#retrynoderegistrationresult)\>

Updated registration status

***

### nodeRegistrationStatus()

> **nodeRegistrationStatus**(`principalId`, `blackboxUrl`, `options?`): `Promise`\<[`NodeRegistrationStatusResult`](../../../../../index.md#noderegistrationstatusresult)\>

Defined in: [web2/auth.ts:487](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/auth.ts#L487)

Check node registration status for a principal.

#### Parameters

##### principalId

`string`

The principal UUID

##### blackboxUrl

`string`

Blackbox URL

##### options?

Optional configuration

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

#### Returns

`Promise`\<[`NodeRegistrationStatusResult`](../../../../../index.md#noderegistrationstatusresult)\>

Node registration status
