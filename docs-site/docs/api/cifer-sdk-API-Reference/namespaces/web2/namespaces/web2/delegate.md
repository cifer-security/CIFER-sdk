[**cifer-sdk API Reference v0.3.1**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/delegate

# web2/delegate

## Description

Web2 delegate management

## Functions

### setDelegate()

> **setDelegate**(`params`): `Promise`\<[`SetWeb2DelegateResult`](../../../../../index.md#setweb2delegateresult)\>

Defined in: [web2/delegate.ts:53](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/delegate.ts#L53)

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
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Remove a delegate
await web2.delegate.setDelegate({
  session,
  secretId: 42,
  delegatePrincipalId: '',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```
