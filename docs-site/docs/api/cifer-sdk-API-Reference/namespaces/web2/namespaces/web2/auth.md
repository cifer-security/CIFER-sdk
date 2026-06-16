[**cifer-sdk API Reference v0.4.1**](../../../../../index.md)

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

Defined in: [web2/auth.ts:79](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L79)

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

Defined in: [web2/auth.ts:125](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L125)

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

Defined in: [web2/auth.ts:182](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L182)

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

Defined in: [web2/auth.ts:238](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L238)

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

Defined in: [web2/auth.ts:266](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L266)

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

Defined in: [web2/auth.ts:292](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L292)

Reset a password using the OTP from forgotPassword.

#### Parameters

##### params

[`ResetPasswordParams`](../../../../../index.md#resetpasswordparams)

Reset password parameters

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

Server message

***

### retryNodeRegistration()

> **retryNodeRegistration**(`params`): `Promise`\<[`RetryNodeRegistrationResult`](../../../../../index.md#retrynoderegistrationresult)\>

Defined in: [web2/auth.ts:323](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L323)

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

Defined in: [web2/auth.ts:362](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/3e58b754041c3874d771d393a6f417ac1cf988a0/src/web2/auth.ts#L362)

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
