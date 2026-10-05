[**cifer-sdk API Reference v0.5.6**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/principal

# web2/principal

## Description

Web2 principal lookup

## Functions

### getByEmail()

> **getByEmail**(`email`, `blackboxUrl`, `options?`): `Promise`\<[`PrincipalByEmailResult`](../../../../../index.md#principalbyemailresult)\>

Defined in: [web2/principal.ts:38](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/principal.ts#L38)

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
  'https://blackbox.cifersecurity.com:3010'
);
console.log('Principal ID:', principal.principalId);
```
