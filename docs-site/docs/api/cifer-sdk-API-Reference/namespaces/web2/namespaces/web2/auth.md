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

Defined in: [web2/auth.ts:81](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L81)

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

Defined in: [web2/auth.ts:127](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L127)

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

Defined in: [web2/auth.ts:184](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L184)

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

Defined in: [web2/auth.ts:240](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L240)

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

Defined in: [web2/auth.ts:268](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L268)

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

Defined in: [web2/auth.ts:294](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L294)

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

Defined in: [web2/auth.ts:343](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L343)

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

### retryNodeRegistration()

> **retryNodeRegistration**(`params`): `Promise`\<[`RetryNodeRegistrationResult`](../../../../../index.md#retrynoderegistrationresult)\>

Defined in: [web2/auth.ts:380](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L380)

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

Defined in: [web2/auth.ts:419](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/auth.ts#L419)

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
