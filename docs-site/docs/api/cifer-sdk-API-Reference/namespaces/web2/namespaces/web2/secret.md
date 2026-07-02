[**cifer-sdk API Reference v0.5.2**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/secret

# web2/secret

## Description

Web2 secret creation and listing

## Functions

### createSecret()

> **createSecret**(`params`): `Promise`\<[`CreateWeb2SecretResult`](../../../../../index.md#createweb2secretresult)\>

Defined in: [web2/secret.ts:45](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/secret.ts#L45)

Create a new Web2 secret.

Data string format: `-1_0_<sessionAddress>_<timestamp>`

#### Parameters

##### params

[`CreateWeb2SecretParams`](../../../../../index.md#createweb2secretparams)

Secret creation parameters

#### Returns

`Promise`\<[`CreateWeb2SecretResult`](../../../../../index.md#createweb2secretresult)\>

Created secret info

#### Example

```typescript
const result = await web2.secret.createSecret({
  session,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
console.log('Secret ID:', result.secretId);
```

***

### listSecrets()

> **listSecrets**(`params`): `Promise`\<[`ListWeb2SecretsResult`](../../../../../index.md#listweb2secretsresult)\>

Defined in: [web2/secret.ts:103](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/bb337d5a2d00f651eb10b722edbb95041bac65bc/src/web2/secret.ts#L103)

List all Web2 secrets for the current principal.

Data string format: `-1_<principalId>_<sessionAddress>_<timestamp>`

#### Parameters

##### params

[`ListWeb2SecretsParams`](../../../../../index.md#listweb2secretsparams)

List parameters

#### Returns

`Promise`\<[`ListWeb2SecretsResult`](../../../../../index.md#listweb2secretsresult)\>

Array of secret info

#### Example

```typescript
const result = await web2.secret.listSecrets({
  session,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
console.log('Secrets:', result.secrets);
```
