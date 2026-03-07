[**cifer-sdk API Reference v0.3.1**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/principal

# web2/principal

## Description

Web2 principal lookup

## Functions

### getByEmail()

> **getByEmail**(`email`, `blackboxUrl`, `options?`): `Promise`\<[`PrincipalByEmailResult`](../../../../../index.md#principalbyemailresult)\>

Defined in: [web2/principal.ts:38](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/principal.ts#L38)

Look up a principal by email address.

#### Parameters

##### email

`string`

The email address to search for

##### blackboxUrl

`string`

Blackbox URL

##### options?

Optional configuration

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

#### Returns

`Promise`\<[`PrincipalByEmailResult`](../../../../../index.md#principalbyemailresult)\>

The principal's UUID and email hex

#### Example

```typescript
const principal = await web2.principal.getByEmail(
  'user@example.com',
  'https://cifer-blackbox.ternoa.dev:3010'
);
console.log('Principal ID:', principal.principalId);
```
