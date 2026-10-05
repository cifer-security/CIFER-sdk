[**cifer-sdk API Reference v0.5.6**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/delegate

# web2/delegate

## Description

Web2 delegate management

## Functions

### setDelegate()

> **setDelegate**(`params`): `Promise`\<[`SetWeb2DelegateResult`](../../../../../index.md#setweb2delegateresult)\>

Defined in: [web2/delegate.ts:53](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/delegate.ts#L53)

Set or remove a delegate for a Web2 secret.

Data string format: `-1_<secretId>_<sessionAddress>_<timestamp>_<delegatePrincipalId>`

#### Parameters

##### params

[`SetWeb2DelegateParams`](../../../../../index.md#setweb2delegateparams)

Delegate parameters

#### Returns

`Promise`\<[`SetWeb2DelegateResult`](../../../../../index.md#setweb2delegateresult)\>

Operation result

#### Example

```typescript
// Set a delegate
await web2.delegate.setDelegate({
  session,
  secretId: 42,
  delegatePrincipalId: 'delegate-principal-uuid',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

// Remove a delegate
await web2.delegate.setDelegate({
  session,
  secretId: 42,
  delegatePrincipalId: '',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
```
