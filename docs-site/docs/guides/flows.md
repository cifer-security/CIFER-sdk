---
sidebar_position: 4
---

# Flows Guide

Learn how to use high-level orchestrated flows for common operations.

## Overview

Flows combine multiple primitives into complete operations. They support two modes:

- **Plan Mode**: Returns a plan describing the steps (dry run)
- **Execute Mode**: Actually performs the operations

## Flow Context

All flows require a context object:

```typescript
import type { FlowContext } from 'cifer-sdk';

const ctx: FlowContext = {
  // Required
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  chainId: 752025,
  
  // Optional
  controllerAddress: sdk.getControllerAddress(752025),
  
  // For execute mode
  txExecutor: async (intent) => {
    const hash = await wallet.sendTransaction(intent);
    return {
      hash,
      waitReceipt: () => provider.waitForTransaction(hash),
    };
  },
  
  // Configuration
  pollingStrategy: {
    intervalMs: 2000,
    maxAttempts: 60,
  },
  
  // Callbacks
  logger: console.log,
  abortSignal: abortController.signal,
};
```

## Available Flows

### Create Secret and Wait Ready

Creates a new secret and waits until it's ready for use.

```typescript
import { flows } from 'cifer-sdk';

// Plan mode - see what will happen
const plan = await flows.createSecretAndWaitReady(ctx, { mode: 'plan' });
console.log('Steps:', plan.plan.steps.map(s => s.description));

// Execute mode - actually create
const result = await flows.createSecretAndWaitReady(ctx, { mode: 'execute' });

if (result.success) {
  console.log('Secret ID:', result.data.secretId);
  console.log('Owner:', result.data.state.owner);
  console.log('Public Key CID:', result.data.state.publicKeyCid);
}
```

**Steps:**
1. Read secret creation fee
2. Submit createSecret transaction
3. Poll until secret is synced

### Encrypt Then Prepare Commit

Encrypts data and prepares a transaction for on-chain storage.

```typescript
const result = await flows.encryptThenPrepareCommitTx(ctx, {
  secretId: 123n,
  plaintext: 'My secret data',
  key: dataKey, // bytes32
  commitmentContract: '0xYourContract...',
  storeFunction: customAbi, // Optional - uses default if not provided
});

if (result.success) {
  console.log('Cifer:', result.data.cifer);
  console.log('Encrypted:', result.data.encryptedMessage);
  
  // Execute the prepared transaction
  await wallet.sendTransaction(result.data.txIntent);
}
```

**Steps:**
1. Encrypt plaintext via blackbox
2. Validate encrypted data sizes
3. Build store transaction

### Retrieve From Logs Then Decrypt

Retrieves encrypted data from on-chain logs and decrypts it.

```typescript
const result = await flows.retrieveFromLogsThenDecrypt(ctx, {
  secretId: 123n,
  dataId: dataKey,
  commitmentContract: '0xYourContract...',
  storedAtBlock: 1000000, // Optional - fetched if not provided
  skipIntegrityCheck: false,
});

if (result.success) {
  console.log('Decrypted:', result.data.decryptedMessage);
}
```

**Steps:**
1. Read commitment metadata (if block not provided)
2. Fetch encrypted data from logs
3. Verify integrity (unless skipped)
4. Decrypt via blackbox

### Encrypt File Job Flow

Encrypts a file and downloads the result.

```typescript
const result = await flows.encryptFileJobFlow(ctx, {
  secretId: 123n,
  file: myFile,
});

if (result.success) {
  console.log('Job ID:', result.data.jobId);
  console.log('Encrypted file:', result.data.encryptedFile);
}
```

**Steps:**
1. Upload file for encryption
2. Poll until job completes
3. Download encrypted file

### Decrypt File Job Flow

Decrypts an encrypted file and downloads the result.

```typescript
const result = await flows.decryptFileJobFlow(ctx, {
  secretId: 123n,
  file: encryptedCiferFile,
});

if (result.success) {
  console.log('Decrypted file:', result.data.decryptedFile);
}
```

**Steps:**
1. Upload encrypted file for decryption
2. Poll until job completes
3. Download decrypted file (with auth)

### Decrypt Existing File Job Flow

Decrypts from an existing encrypt job without re-uploading.

```typescript
const result = await flows.decryptExistingFileJobFlow(ctx, {
  secretId: 123n,
  encryptJobId: 'previous-job-id',
});

if (result.success) {
  console.log('Decrypted file:', result.data.decryptedFile);
}
```

**Steps:**
1. Create decrypt job from existing encrypt job
2. Poll until job completes
3. Download decrypted file (with auth)

## Plan Mode

Use plan mode to preview what a flow will do:

```typescript
const plan = await flows.createSecretAndWaitReady(ctx, { mode: 'plan' });

console.log('Flow:', plan.plan.name);
console.log('Description:', plan.plan.description);
console.log('Estimated duration:', plan.plan.estimatedDurationMs, 'ms');

for (const step of plan.plan.steps) {
  console.log(`- ${step.description} (${step.type})`);
}
```

Output:
```
Flow: createSecretAndWaitReady
Description: Create a new CIFER secret and wait until it is ready
Estimated duration: 60000 ms
- Read secret creation fee (read)
- Create secret transaction (transaction)
- Wait for secret to sync (poll)
```

## Progress Tracking

Track step progress during execution:

```typescript
const result = await flows.encryptFileJobFlow(ctx, {
  secretId: 123n,
  file: myFile,
}, {
  onStepProgress: (step) => {
    console.log(`Step ${step.id}: ${step.status}`);
    if (step.status === 'in_progress') {
      updateUI(step.description);
    }
  },
});
```

## Cancellation

Cancel a flow using AbortSignal:

```typescript
const abortController = new AbortController();

// Start the flow
const promise = flows.createSecretAndWaitReady({
  ...ctx,
  abortSignal: abortController.signal,
});

// Cancel after 30 seconds
setTimeout(() => {
  abortController.abort();
}, 30000);

try {
  const result = await promise;
} catch (error) {
  if (error instanceof FlowAbortedError) {
    console.log('Flow was cancelled');
  }
}
```

## Error Handling

```typescript
import {
  FlowError,
  FlowAbortedError,
  FlowTimeoutError,
} from 'cifer-sdk';

const result = await flows.createSecretAndWaitReady(ctx);

if (!result.success) {
  if (result.error instanceof FlowAbortedError) {
    console.log('Flow was aborted');
  } else if (result.error instanceof FlowTimeoutError) {
    console.log('Flow timed out:', result.error.timeoutMs);
  } else if (result.error instanceof FlowError) {
    console.log('Flow failed at step:', result.error.stepName);
  }
  
  // Check which step failed
  const failedStep = result.plan.steps.find(s => s.status === 'failed');
  if (failedStep) {
    console.log('Failed step:', failedStep.description);
    console.log('Error:', failedStep.error);
  }
}
```

## Custom Polling Strategy

Adjust polling behavior for long-running operations:

```typescript
const ctx: FlowContext = {
  ...baseCtx,
  pollingStrategy: {
    intervalMs: 5000,       // Poll every 5 seconds
    maxAttempts: 120,       // Up to 10 minutes
    backoffMultiplier: 1.5, // Increase interval on each attempt
    maxIntervalMs: 30000,   // Cap at 30 seconds
  },
};
```

## Best Practices

### 1. Always Check Success

```typescript
const result = await flows.encryptThenPrepareCommitTx(ctx, params);

if (!result.success) {
  // Handle the error
  console.error('Flow failed:', result.error);
  return;
}

// Safe to use result.data
const txIntent = result.data.txIntent;
```

### 2. Use Plan Mode for Preview

```typescript
// Show user what will happen before executing
const plan = await flows.createSecretAndWaitReady(ctx, { mode: 'plan' });
const confirmed = await showConfirmationDialog(plan);

if (confirmed) {
  const result = await flows.createSecretAndWaitReady(ctx, { mode: 'execute' });
}
```

### 3. Provide User Feedback

```typescript
const result = await flows.encryptFileJobFlow(ctx, {
  secretId,
  file,
}, {
  onStepProgress: (step) => {
    setCurrentStep(step.description);
    setStepStatus(step.status);
  },
});
```

### 4. Support Cancellation

```typescript
function EncryptButton({ file }) {
  const [abort, setAbort] = useState<AbortController | null>(null);
  
  const start = async () => {
    const controller = new AbortController();
    setAbort(controller);
    
    try {
      await flows.encryptFileJobFlow({
        ...ctx,
        abortSignal: controller.signal,
      }, { secretId, file });
    } finally {
      setAbort(null);
    }
  };
  
  const cancel = () => abort?.abort();
  
  return abort 
    ? <button onClick={cancel}>Cancel</button>
    : <button onClick={start}>Encrypt</button>;
}
```

### 5. Handle Receipts

```typescript
const result = await flows.createSecretAndWaitReady(ctx);

if (result.success && result.receipts) {
  for (const receipt of result.receipts) {
    console.log('Transaction:', receipt.transactionHash);
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed);
  }
}
```
