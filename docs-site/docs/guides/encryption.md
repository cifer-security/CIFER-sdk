---
sidebar_position: 2
---

# Encryption Guide

Learn how to encrypt and decrypt data using the CIFER blackbox API.

## Overview

The `blackbox` namespace provides three sub-namespaces:

- `payload` - Encrypt/decrypt short messages (< 16KB)
- `files` - Encrypt/decrypt large files (async via jobs)
- `jobs` - Manage async file operations

## Payload Encryption

For short messages that fit in a single transaction or API call.

### Encrypt

```typescript
import { blackbox } from 'cifer-sdk';

const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My secret message',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  outputFormat: 'hex', // or 'base64'
});

console.log('CIFER envelope:', encrypted.cifer);
console.log('Encrypted message:', encrypted.encryptedMessage);
```

### Decrypt

```typescript
const decrypted = await blackbox.payload.decryptPayload({
  chainId: 752025,
  secretId: 123n,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  inputFormat: 'hex', // or 'base64'
});

console.log('Decrypted:', decrypted.decryptedMessage);
```

### Output Formats

| Format | Use Case |
|--------|----------|
| `hex` | On-chain storage, JSON APIs |
| `base64` | Web APIs, compact storage |

## File Encryption

For large files, use the async job system.

### Encrypt a File

```typescript
// Start the encryption job
const job = await blackbox.files.encryptFile({
  chainId: 752025,
  secretId: 123n,
  file: myFile, // File or Blob
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

console.log('Job started:', job.jobId);

// Poll until complete
const status = await blackbox.jobs.pollUntilComplete(
  job.jobId,
  sdk.blackboxUrl,
  {
    intervalMs: 2000,
    maxAttempts: 120,
    onProgress: (job) => console.log(`Progress: ${job.progress}%`),
  }
);

// Download result (no auth required for encrypt jobs)
const encryptedBlob = await blackbox.jobs.download(job.jobId, {
  blackboxUrl: sdk.blackboxUrl,
});

// Save the .cifer file
saveAs(encryptedBlob, 'encrypted.cifer');
```

### Decrypt a File

```typescript
// Upload for decryption
const job = await blackbox.files.decryptFile({
  chainId: 752025,
  secretId: 123n,
  file: encryptedCiferFile,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

// Poll until complete
const status = await blackbox.jobs.pollUntilComplete(job.jobId, sdk.blackboxUrl);

// Download (auth required for decrypt jobs)
const decryptedBlob = await blackbox.jobs.download(job.jobId, {
  blackboxUrl: sdk.blackboxUrl,
  chainId: 752025,
  secretId: 123n,
  signer,
  readClient: sdk.readClient,
});
```

### Decrypt Existing File

Re-decrypt a previously encrypted file without re-uploading:

```typescript
const job = await blackbox.files.decryptExistingFile({
  chainId: 752025,
  secretId: 123n,
  encryptJobId: 'previous-encrypt-job-id',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});
```

## Using Flows

For a simpler experience, use the high-level flows:

### Encrypt File Flow

```typescript
import { flows } from 'cifer-sdk';

const result = await flows.encryptFileJobFlow(ctx, {
  secretId: 123n,
  file: myFile,
});

if (result.success) {
  console.log('Encrypted file:', result.data.encryptedFile);
}
```

### Decrypt File Flow

```typescript
const result = await flows.decryptFileJobFlow(ctx, {
  secretId: 123n,
  file: encryptedFile,
});

if (result.success) {
  console.log('Decrypted file:', result.data.decryptedFile);
}
```

## Job Management

### Check Job Status

```typescript
const status = await blackbox.jobs.getStatus(jobId, sdk.blackboxUrl);

console.log('Status:', status.status);
console.log('Progress:', status.progress);
console.log('Type:', status.type);
```

### List Jobs

```typescript
const result = await blackbox.jobs.list({
  chainId: 752025,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  includeExpired: false,
});

for (const job of result.jobs) {
  console.log(`${job.id}: ${job.status} (${job.progress}%)`);
}
```

### Delete a Job

```typescript
await blackbox.jobs.deleteJob(jobId, {
  chainId: 752025,
  secretId: 123n,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});
```

### Data Consumption

Check your usage limits:

```typescript
const usage = await blackbox.jobs.dataConsumption({
  chainId: 752025,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

console.log('Encryption used:', usage.encryption.usedGB, 'GB');
console.log('Encryption remaining:', usage.encryption.remainingGB, 'GB');
```

## Error Handling

```typescript
import {
  BlackboxError,
  EncryptionError,
  DecryptionError,
  BlockStaleError,
  SecretNotReadyError,
  isBlockStaleError,
  isCiferError,
} from 'cifer-sdk';

try {
  await blackbox.payload.encryptPayload({ ... });
} catch (error) {
  if (isBlockStaleError(error)) {
    // SDK already retried - this indicates a persistent issue
    console.log('Stale block error after retries');
  } else if (error instanceof SecretNotReadyError) {
    console.log('Secret is still syncing');
  } else if (error instanceof EncryptionError) {
    console.log('Encryption failed:', error.message);
  } else if (error instanceof BlackboxError) {
    console.log('Blackbox error:', error.message, error.statusCode);
  }
  
  // All SDK errors include cause for error chaining
  if (isCiferError(error) && error.cause) {
    console.log('Underlying error:', error.cause);
  }
}
```

:::tip Debug Logging
The SDK doesn't log by default. To see progress messages, pass a `logger` when creating the SDK:

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  logger: console.log,
});
```

See [Debugging & Logging](/docs/getting-started/concepts#debugging--logging) for more details.
:::

## Best Practices

### 1. Choose the Right Method

| Data Size | Method |
|-----------|--------|
| < 16 KB | `payload.encryptPayload` |
| > 16 KB | `files.encryptFile` |

### 2. Handle Block Freshness

The SDK automatically retries on stale block errors, but you should:

- Use reliable RPC endpoints
- Minimize time between signing and API calls
- Consider retry logic for persistent failures

### 3. Secure File Handling

```typescript
// Use Blob/File APIs properly
const file = new File([content], 'data.txt', { type: 'text/plain' });

// Clean up after use
URL.revokeObjectURL(downloadUrl);
```

### 4. Monitor Job Progress

```typescript
const status = await blackbox.jobs.pollUntilComplete(jobId, blackboxUrl, {
  onProgress: (job) => {
    updateProgressBar(job.progress);
  },
  abortSignal: abortController.signal, // Support cancellation
});
```

### 5. Handle Large Files

For very large files:

- Show progress to users
- Support cancellation
- Implement chunked uploads (future SDK feature)
