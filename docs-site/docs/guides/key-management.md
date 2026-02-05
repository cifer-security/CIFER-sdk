---
sidebar_position: 1
---

# Key Management Guide

Learn how to create, manage, and delegate CIFER secrets.

## Overview

The `keyManagement` namespace provides functions for interacting with the SecretsController contract. This includes:

- Reading secret state and fees
- Building transactions for secret creation and management
- Parsing events from transaction receipts

## Creating a Secret

### Step 1: Get the Creation Fee

```typescript
import { keyManagement } from 'cifer-sdk';

const fee = await keyManagement.getSecretCreationFee({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  readClient: sdk.readClient,
});

console.log('Fee:', fee, 'wei');
```

### Step 2: Build and Submit Transaction

```typescript
const txIntent = keyManagement.buildCreateSecretTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  fee,
});

// Execute with your wallet
const hash = await wallet.sendTransaction({
  to: txIntent.to,
  data: txIntent.data,
  value: txIntent.value,
});
```

### Step 3: Extract Secret ID

```typescript
const receipt = await provider.waitForTransaction(hash);
const secretId = keyManagement.extractSecretIdFromReceipt(receipt.logs);

console.log('Created secret:', secretId);
```

### Step 4: Wait for Sync

New secrets need time to sync before use:

```typescript
let isReady = false;
while (!isReady) {
  isReady = await keyManagement.isSecretReady({
    chainId: 752025,
    controllerAddress: sdk.getControllerAddress(752025),
    readClient: sdk.readClient,
  }, secretId);
  
  if (!isReady) {
    console.log('Waiting for sync...');
    await sleep(5000);
  }
}

console.log('Secret is ready!');
```

## Using the Flow

For a simpler experience, use the `createSecretAndWaitReady` flow:

```typescript
import { flows } from 'cifer-sdk';

const result = await flows.createSecretAndWaitReady({
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  txExecutor: async (intent) => {
    const hash = await wallet.sendTransaction(intent);
    return {
      hash,
      waitReceipt: () => provider.waitForTransaction(hash),
    };
  },
  logger: console.log,
});

if (result.success) {
  console.log('Secret ID:', result.data.secretId);
  console.log('Public Key CID:', result.data.state.publicKeyCid);
}
```

## Reading Secret State

### Get Full State

```typescript
const state = await keyManagement.getSecret({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  readClient: sdk.readClient,
}, secretId);

console.log('Owner:', state.owner);
console.log('Delegate:', state.delegate);
console.log('Is Syncing:', state.isSyncing);
console.log('Public Key CID:', state.publicKeyCid);
```

### Get Secrets by Wallet

```typescript
const secrets = await keyManagement.getSecretsByWallet({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  readClient: sdk.readClient,
}, walletAddress);

console.log('Owned:', secrets.owned);
console.log('Delegated:', secrets.delegated);
```

### Check Authorization

```typescript
const isAuthorized = await keyManagement.isAuthorized({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  readClient: sdk.readClient,
}, secretId, address);

if (isAuthorized) {
  console.log('Address can decrypt');
}
```

## Managing Delegation

### Set a Delegate

Allow another address to decrypt (but not encrypt):

```typescript
const txIntent = keyManagement.buildSetDelegateTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  secretId: 123n,
  newDelegate: '0xDelegateAddress...',
});

await wallet.sendTransaction(txIntent);
```

### Remove Delegation

```typescript
const txIntent = keyManagement.buildRemoveDelegationTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  secretId: 123n,
});

await wallet.sendTransaction(txIntent);
```

## Transferring Ownership

Transfer a secret to a new owner (clears any delegate):

```typescript
const txIntent = keyManagement.buildTransferSecretTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  secretId: 123n,
  newOwner: '0xNewOwner...',
});

await wallet.sendTransaction(txIntent);
```

:::warning Irreversible
Ownership transfer is irreversible. The new owner gains full control and the previous owner loses all access.
:::

## Event Parsing

Parse events from transaction receipts:

```typescript
// Parse SecretCreated event
const secretCreatedLog = receipt.logs.find(
  log => log.topics[0] === SECRETS_CONTROLLER_TOPICS.SecretCreated
);
if (secretCreatedLog) {
  const event = keyManagement.parseSecretCreatedLog(secretCreatedLog);
  console.log('New secret:', event.secretId);
}

// Parse SecretSynced event
const secretSyncedLog = receipt.logs.find(
  log => log.topics[0] === SECRETS_CONTROLLER_TOPICS.SecretSynced
);
if (secretSyncedLog) {
  const event = keyManagement.parseSecretSyncedLog(secretSyncedLog);
  console.log('Synced secret:', event.secretId);
  console.log('Public key CID:', event.publicKeyCid);
}
```

## Error Handling

```typescript
import { SecretNotFoundError, KeyManagementError } from 'cifer-sdk';

try {
  const state = await keyManagement.getSecret({ ... }, secretId);
} catch (error) {
  if (error instanceof SecretNotFoundError) {
    console.log('Secret does not exist:', error.secretId);
  } else if (error instanceof KeyManagementError) {
    console.log('Key management error:', error.message);
  }
}
```

## Best Practices

1. **Cache secret states** - Avoid redundant RPC calls
2. **Check readiness** - Always verify `isSecretReady` before encryption
3. **Handle sync time** - Budget ~60 seconds for new secret sync
4. **Validate ownership** - Check authorization before attempting decryption
5. **Monitor events** - Use WebSocket subscriptions for real-time updates
