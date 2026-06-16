---
sidebar_position: 4
---

# File Encryption

Learn how to encrypt and decrypt large files in CIFER Web2 mode using the async job system.

## Prerequisites

This guide assumes you have already [set up authentication](/docs/guides/web2/authentication) (registered, verified email, created a session). Here is a quick setup recap:

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';

const sdk = await createCiferSdk({
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

const client = web2.createClient({
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

// Session already created (see Authentication guide)
await client.createManagedSession({
  principalId: 'your-principal-uuid',
  ed25519Signer: myEd25519Signer,
});
```

## Encrypt a File

```typescript
// Start the encryption job
const job = await web2.blackbox.files.encryptFile({
  session,
  secretId: 42,
  file: myFile,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});

console.log('Job started:', job.jobId);

// Poll until complete (no session needed)
const status = await web2.blackbox.jobs.pollUntilComplete(
  job.jobId,
  'https://blackbox.cifersecurity.com:3010',
  {
    onProgress: (job) => console.log(`Progress: ${job.progress}%`),
  }
);

// Download encrypted file (no session needed for encrypt jobs)
const { download } = await import('cifer-sdk/blackbox');
const encryptedBlob = await download(job.jobId, {
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

// Save the .cifer file
saveAs(encryptedBlob, 'encrypted.cifer');
```

## Decrypt a File

```typescript
// Upload for decryption (session needed)
const decryptJob = await web2.blackbox.files.decryptFile({
  session,
  secretId: 42,
  file: encryptedCiferFile,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});

// Poll until complete
await web2.blackbox.jobs.pollUntilComplete(
  decryptJob.jobId,
  'https://blackbox.cifersecurity.com:3010'
);

// Download decrypted file (session needed for decrypt jobs)
const decryptedBlob = await web2.blackbox.jobs.download(
  decryptJob.jobId,
  {
    session,
    secretId: 42,
    blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
    readClient: sdk.readClient,
  }
);
```

## Job Management

### List Jobs

```typescript
const jobs = await web2.blackbox.jobs.list({
  session,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});

for (const job of jobs.jobs) {
  console.log(`${job.id}: ${job.status} (${job.progress}%)`);
}
```

### Delete a Job

```typescript
await web2.blackbox.jobs.deleteJob('job-id', {
  session,
  secretId: 42,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});
```

### Data Consumption

Check your usage limits:

```typescript
const usage = await web2.blackbox.jobs.dataConsumption({
  session,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});

console.log('Encryption used:', usage.encryption.usedGB, 'GB');
console.log('Encryption remaining:', usage.encryption.remainingGB, 'GB');
```

## Error Handling

```typescript
import {
  Web2Error,
  Web2SessionError,
  BlackboxError,
  EncryptionError,
  isWeb2SessionError,
  isCiferError,
} from 'cifer-sdk';

try {
  await web2.blackbox.files.encryptFile({ ... });
} catch (error) {
  if (isWeb2SessionError(error)) {
    console.log('Session error:', error.message);
  } else if (error instanceof EncryptionError) {
    console.log('Encryption failed:', error.message);
  } else if (error instanceof BlackboxError) {
    console.log('Blackbox error:', error.message, error.statusCode);
  } else if (isCiferError(error)) {
    console.log('CIFER error:', error.code, error.message);
  }
}
```

## Best Practices

1. **Show progress** - Use `onProgress` callback to display progress bars for large files.
2. **Support cancellation** - Pass `abortSignal` to allow users to cancel long-running jobs.
3. **Clean up** - Delete completed jobs when no longer needed.
4. **Session handling** - Note that encrypt-job downloads don't need a session, but decrypt-job downloads do.

## Next Steps

- [Text Encryption (Web2)](/docs/guides/web2/text-encryption) - Encrypt and decrypt short text payloads
- [Secret Management (Web2)](/docs/guides/web2/secret-management) - Create and manage secrets
- [Authentication & Sessions](/docs/guides/web2/authentication) - Registration, keys, and session management
- Looking for Web3? See [File Encryption (Web3)](/docs/guides/web3/file-encryption)
