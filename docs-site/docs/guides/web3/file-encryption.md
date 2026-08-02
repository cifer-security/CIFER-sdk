---
sidebar_position: 4
---

# File Encryption

Learn how to encrypt and decrypt large files using the CIFER async job system.

## Overview

The `blackbox.files` namespace provides async file encryption and decryption via a job system. Use this for data larger than 16KB. For short text payloads, see [Text Encryption](/docs/guides/web3/text-encryption).

## Encrypt a File

```typescript
import { blackbox } from 'cifer-sdk';

// Start the encryption job
const job = await blackbox.files.encryptFile({
  chainId: 8453,
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

## Decrypt a File

```typescript
// Upload for decryption
const job = await blackbox.files.decryptFile({
  chainId: 8453,
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
  chainId: 8453,
  secretId: 123n,
  signer,
  readClient: sdk.readClient,
});
```

## Decrypt Existing File

Re-decrypt a previously encrypted file without re-uploading:

```typescript
const job = await blackbox.files.decryptExistingFile({
  chainId: 8453,
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
  chainId: 8453,
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
  chainId: 8453,
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
  chainId: 8453,
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
  await blackbox.files.encryptFile({ ... });
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
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  logger: console.log,
});
```

See [Debugging & Logging](/docs/getting-started/concepts#debugging--logging) for more details.
:::

## Best Practices

### 1. Secure File Handling

```typescript
// Use Blob/File APIs properly
const file = new File([content], 'data.txt', { type: 'text/plain' });

// Clean up after use
URL.revokeObjectURL(downloadUrl);
```

### 2. Monitor Job Progress

```typescript
const status = await blackbox.jobs.pollUntilComplete(jobId, blackboxUrl, {
  onProgress: (job) => {
    updateProgressBar(job.progress);
  },
  abortSignal: abortController.signal, // Support cancellation
});
```

### 3. Handle Large Files

For very large files:

- Show progress to users
- Support cancellation
- Implement chunked uploads (future SDK feature)

## Next Steps

- [Text Encryption](/docs/guides/web3/text-encryption) - Encrypt and decrypt short text payloads
- [Secret Management](/docs/guides/web3/secret-management) - Create and manage secrets
- [Flows](/docs/guides/web3/flows) - High-level orchestrated operations
- Looking for Web2? See [File Encryption (Web2)](/docs/guides/web2/file-encryption)
