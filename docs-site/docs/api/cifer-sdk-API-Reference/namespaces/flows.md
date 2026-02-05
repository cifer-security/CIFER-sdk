[**cifer-sdk API Reference v0.3.0**](../../index.md)

***

[cifer-sdk API Reference](../../index.md) / flows

# flows

High-level orchestrated flows for common operations.

## Remarks

Flows combine multiple primitives into complete operations and support
two modes:
- **Plan mode**: Returns a plan with steps that would be executed
- **Execute mode**: Executes the flow using provided callbacks

## Interfaces

### CreateSecretResult

Defined in: [flows/create-secret.ts:27](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/create-secret.ts#L27)

Result of createSecretAndWaitReady flow

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [flows/create-secret.ts:29](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/create-secret.ts#L29)

The new secret ID

##### state

> **state**: [`SecretState`](../../index.md#secretstate)

Defined in: [flows/create-secret.ts:31](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/create-secret.ts#L31)

The final secret state

***

### RetrieveAndDecryptParams

Defined in: [flows/decrypt-from-logs.ts:24](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L24)

Parameters for retrieve-and-decrypt flow

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [flows/decrypt-from-logs.ts:26](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L26)

Secret ID used for encryption

##### dataId

> **dataId**: `` `0x${string}` ``

Defined in: [flows/decrypt-from-logs.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L28)

Data ID to retrieve

##### commitmentContract

> **commitmentContract**: `` `0x${string}` ``

Defined in: [flows/decrypt-from-logs.ts:30](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L30)

Contract address where the commitment is stored

##### storedAtBlock?

> `optional` **storedAtBlock**: `number`

Defined in: [flows/decrypt-from-logs.ts:32](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L32)

Block number where the data was stored (optional - fetched if not provided)

##### skipIntegrityCheck?

> `optional` **skipIntegrityCheck**: `boolean`

Defined in: [flows/decrypt-from-logs.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L34)

Skip integrity verification (default: false)

***

### RetrieveAndDecryptResult

Defined in: [flows/decrypt-from-logs.ts:40](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L40)

Result of retrieveFromLogsThenDecrypt flow

#### Properties

##### decryptedMessage

> **decryptedMessage**: `string`

Defined in: [flows/decrypt-from-logs.ts:42](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L42)

The decrypted plaintext

##### secretId

> **secretId**: `bigint`

Defined in: [flows/decrypt-from-logs.ts:44](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L44)

The secret ID used

##### storedAtBlock

> **storedAtBlock**: `number`

Defined in: [flows/decrypt-from-logs.ts:46](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L46)

Block where the commitment was stored

***

### EncryptThenCommitParams

Defined in: [flows/encrypt-commit.ts:24](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L24)

Parameters for encrypt-then-commit flow

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [flows/encrypt-commit.ts:26](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L26)

Secret ID to use for encryption

##### plaintext

> **plaintext**: `string`

Defined in: [flows/encrypt-commit.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L28)

The plaintext to encrypt

##### key

> **key**: `` `0x${string}` ``

Defined in: [flows/encrypt-commit.ts:30](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L30)

Key for the commitment (bytes32)

##### commitmentContract

> **commitmentContract**: `` `0x${string}` ``

Defined in: [flows/encrypt-commit.ts:32](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L32)

Contract address for storing the commitment

##### storeFunction?

> `optional` **storeFunction**: [`AbiFunction`](commitments.md#abifunction)

Defined in: [flows/encrypt-commit.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L34)

Store function ABI (optional - uses default if not provided)

***

### EncryptThenCommitResult

Defined in: [flows/encrypt-commit.ts:40](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L40)

Result of encryptThenPrepareCommitTx flow

#### Properties

##### cifer

> **cifer**: `` `0x${string}` ``

Defined in: [flows/encrypt-commit.ts:42](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L42)

The CIFER envelope

##### encryptedMessage

> **encryptedMessage**: `` `0x${string}` ``

Defined in: [flows/encrypt-commit.ts:44](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L44)

The encrypted message

##### txIntent

> **txIntent**: [`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Defined in: [flows/encrypt-commit.ts:46](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L46)

The prepared transaction intent

***

### EncryptFileFlowParams

Defined in: [flows/file-jobs.ts:25](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L25)

Parameters for file encryption flow

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [flows/file-jobs.ts:27](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L27)

Secret ID to use for encryption

##### file

> **file**: `Blob` \| `File`

Defined in: [flows/file-jobs.ts:29](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L29)

The file to encrypt

***

### EncryptFileFlowResult

Defined in: [flows/file-jobs.ts:35](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L35)

Result of file encryption flow

#### Properties

##### jobId

> **jobId**: `string`

Defined in: [flows/file-jobs.ts:37](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L37)

The job ID

##### job

> **job**: [`JobInfo`](../../index.md#jobinfo)

Defined in: [flows/file-jobs.ts:39](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L39)

Final job status

##### encryptedFile

> **encryptedFile**: `Blob`

Defined in: [flows/file-jobs.ts:41](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L41)

The encrypted file blob

***

### DecryptFileFlowParams

Defined in: [flows/file-jobs.ts:181](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L181)

Parameters for file decryption flow

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [flows/file-jobs.ts:183](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L183)

Secret ID used for encryption

##### file

> **file**: `Blob` \| `File`

Defined in: [flows/file-jobs.ts:185](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L185)

The encrypted .cifer file

***

### DecryptFileFlowResult

Defined in: [flows/file-jobs.ts:191](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L191)

Result of file decryption flow

#### Properties

##### jobId

> **jobId**: `string`

Defined in: [flows/file-jobs.ts:193](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L193)

The job ID

##### job

> **job**: [`JobInfo`](../../index.md#jobinfo)

Defined in: [flows/file-jobs.ts:195](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L195)

Final job status

##### decryptedFile

> **decryptedFile**: `Blob`

Defined in: [flows/file-jobs.ts:197](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L197)

The decrypted file blob

***

### DecryptExistingFileFlowParams

Defined in: [flows/file-jobs.ts:341](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L341)

Parameters for decrypting from an existing encrypt job

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [flows/file-jobs.ts:343](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L343)

Secret ID used for the original encryption

##### encryptJobId

> **encryptJobId**: `string`

Defined in: [flows/file-jobs.ts:345](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L345)

Job ID of the completed encrypt job

***

### FlowStep

Defined in: [flows/types.ts:24](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L24)

A single step in a flow

#### Properties

##### id

> **id**: `string`

Defined in: [flows/types.ts:26](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L26)

Step identifier

##### description

> **description**: `string`

Defined in: [flows/types.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L28)

Human-readable description

##### type

> **type**: `"transaction"` \| `"api_call"` \| `"poll"` \| `"read"` \| `"compute"`

Defined in: [flows/types.ts:30](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L30)

Step type

##### status

> **status**: [`StepStatus`](#stepstatus)

Defined in: [flows/types.ts:32](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L32)

Current status

##### txIntent?

> `optional` **txIntent**: [`TxIntent`](../../index.md#txintent)

Defined in: [flows/types.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L34)

Transaction intent (for transaction steps)

##### result?

> `optional` **result**: `unknown`

Defined in: [flows/types.ts:36](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L36)

Result data (after completion)

##### error?

> `optional` **error**: `Error`

Defined in: [flows/types.ts:38](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L38)

Error (if failed)

***

### FlowPlan

Defined in: [flows/types.ts:44](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L44)

Flow plan returned in plan mode

#### Properties

##### name

> **name**: `string`

Defined in: [flows/types.ts:46](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L46)

Flow name

##### description

> **description**: `string`

Defined in: [flows/types.ts:48](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L48)

Human-readable description

##### steps

> **steps**: [`FlowStep`](#flowstep)[]

Defined in: [flows/types.ts:50](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L50)

Ordered list of steps

##### estimatedDurationMs?

> `optional` **estimatedDurationMs**: `number`

Defined in: [flows/types.ts:52](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L52)

Estimated total duration (if known)

***

### PollingStrategy

Defined in: [flows/types.ts:58](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L58)

Polling strategy configuration

#### Properties

##### intervalMs

> **intervalMs**: `number`

Defined in: [flows/types.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L60)

Interval between polls in milliseconds

##### maxAttempts

> **maxAttempts**: `number`

Defined in: [flows/types.ts:62](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L62)

Maximum number of polling attempts

##### backoffMultiplier?

> `optional` **backoffMultiplier**: `number`

Defined in: [flows/types.ts:64](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L64)

Backoff multiplier (default: 1 = no backoff)

##### maxIntervalMs?

> `optional` **maxIntervalMs**: `number`

Defined in: [flows/types.ts:66](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L66)

Maximum interval (for exponential backoff)

***

### FlowContext

Defined in: [flows/types.ts:81](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L81)

Flow context with all dependencies and callbacks

#### Properties

##### signer

> **signer**: [`SignerAdapter`](../../index.md#signeradapter)

Defined in: [flows/types.ts:83](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L83)

Signer for authentication

##### readClient

> **readClient**: [`ReadClient`](../../index.md#readclient-1)

Defined in: [flows/types.ts:85](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L85)

Read client for blockchain queries

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [flows/types.ts:87](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L87)

Blackbox URL

##### chainId

> **chainId**: `number`

Defined in: [flows/types.ts:89](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L89)

Chain ID

##### controllerAddress?

> `optional` **controllerAddress**: `` `0x${string}` ``

Defined in: [flows/types.ts:91](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L91)

SecretsController address (optional - can be resolved from discovery)

##### txExecutor?

> `optional` **txExecutor**: [`TxExecutor`](../../index.md#txexecutor)

Defined in: [flows/types.ts:101](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L101)

Transaction executor callback

Apps provide this to execute transaction intents.
The SDK doesn't handle gas estimation or nonce management.

##### pollingStrategy?

> `optional` **pollingStrategy**: [`PollingStrategy`](#pollingstrategy)

Defined in: [flows/types.ts:106](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L106)

Polling strategy for operations that require waiting

##### logger()?

> `optional` **logger**: (`message`) => `void`

Defined in: [flows/types.ts:111](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L111)

Logger for progress updates

###### Parameters

###### message

`string`

###### Returns

`void`

##### abortSignal?

> `optional` **abortSignal**: `AbortSignal`

Defined in: [flows/types.ts:116](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L116)

Abort signal for cancellation

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [flows/types.ts:121](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L121)

Custom fetch implementation

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

***

### FlowOptions

Defined in: [flows/types.ts:127](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L127)

Options for flow execution

#### Properties

##### mode?

> `optional` **mode**: [`FlowMode`](#flowmode)

Defined in: [flows/types.ts:133](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L133)

Execution mode
- 'plan': Return a plan without executing
- 'execute': Execute the flow (requires txExecutor)

##### onStepProgress()?

> `optional` **onStepProgress**: (`step`) => `void`

Defined in: [flows/types.ts:138](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L138)

Callback for step progress updates

###### Parameters

###### step

[`FlowStep`](#flowstep)

###### Returns

`void`

***

### FlowResult

Defined in: [flows/types.ts:144](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L144)

Flow execution result

#### Type Parameters

##### T

`T`

#### Properties

##### success

> **success**: `boolean`

Defined in: [flows/types.ts:146](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L146)

Whether the flow completed successfully

##### plan

> **plan**: [`FlowPlan`](#flowplan)

Defined in: [flows/types.ts:148](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L148)

The flow plan (steps that were/would be executed)

##### data?

> `optional` **data**: `T`

Defined in: [flows/types.ts:150](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L150)

Result data (if successful)

##### error?

> `optional` **error**: `Error`

Defined in: [flows/types.ts:152](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L152)

Error (if failed)

##### receipts?

> `optional` **receipts**: [`TransactionReceipt`](../../index.md#transactionreceipt)[]

Defined in: [flows/types.ts:154](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L154)

Transaction receipts (for flows that submit transactions)

## Type Aliases

### FlowMode

> **FlowMode** = `"plan"` \| `"execute"`

Defined in: [flows/types.ts:14](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L14)

Flow execution mode

***

### StepStatus

> **StepStatus** = `"pending"` \| `"in_progress"` \| `"completed"` \| `"failed"` \| `"skipped"`

Defined in: [flows/types.ts:19](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L19)

Flow step status

## Variables

### DEFAULT\_POLLING\_STRATEGY

> `const` **DEFAULT\_POLLING\_STRATEGY**: [`PollingStrategy`](#pollingstrategy)

Defined in: [flows/types.ts:72](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/types.ts#L72)

Default polling strategy

## Functions

### createSecretAndWaitReady()

> **createSecretAndWaitReady**(`ctx`, `options?`): `Promise`\<[`FlowResult`](#flowresult)\<[`CreateSecretResult`](#createsecretresult)\>\>

Defined in: [flows/create-secret.ts:66](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/create-secret.ts#L66)

Create a new secret and wait until it's ready for use

This flow:
1. Reads the secret creation fee
2. Builds and executes the createSecret transaction
3. Extracts the secret ID from the receipt
4. Polls until isSyncing becomes false

#### Parameters

##### ctx

[`FlowContext`](#flowcontext)

Flow context

##### options?

[`FlowOptions`](#flowoptions)

Flow options

#### Returns

`Promise`\<[`FlowResult`](#flowresult)\<[`CreateSecretResult`](#createsecretresult)\>\>

Flow result with secret ID and state

#### Example

```typescript
// Plan mode - see what will happen
const plan = await createSecretAndWaitReady(ctx, { mode: 'plan' });
console.log('Steps:', plan.plan.steps.map(s => s.description));

// Execute mode - actually create the secret
const result = await createSecretAndWaitReady({
  ...ctx,
  txExecutor: async (intent) => {
    const hash = await wallet.sendTransaction(intent);
    return { hash, waitReceipt: () => provider.waitForTransaction(hash) };
  },
}, { mode: 'execute' });

console.log('Secret ID:', result.data.secretId);
console.log('Public key CID:', result.data.state.publicKeyCid);
```

***

### retrieveFromLogsThenDecrypt()

> **retrieveFromLogsThenDecrypt**(`ctx`, `params`, `options?`): `Promise`\<[`FlowResult`](#flowresult)\<[`RetrieveAndDecryptResult`](#retrieveanddecryptresult)\>\>

Defined in: [flows/decrypt-from-logs.ts:76](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/decrypt-from-logs.ts#L76)

Retrieve encrypted data from on-chain logs and decrypt it

This flow:
1. Fetches commitment metadata (if block not provided)
2. Retrieves cifer and encryptedMessage from event logs
3. Verifies data integrity (optional)
4. Decrypts the data using the blackbox

#### Parameters

##### ctx

[`FlowContext`](#flowcontext)

Flow context

##### params

[`RetrieveAndDecryptParams`](#retrieveanddecryptparams)

Retrieval and decryption parameters

##### options?

[`FlowOptions`](#flowoptions)

Flow options

#### Returns

`Promise`\<[`FlowResult`](#flowresult)\<[`RetrieveAndDecryptResult`](#retrieveanddecryptresult)\>\>

Flow result with decrypted message

#### Example

```typescript
const result = await retrieveFromLogsThenDecrypt(ctx, {
  secretId: 123n,
  dataId: '0x...',
  commitmentContract: '0x...',
});

if (result.success) {
  console.log('Decrypted:', result.data.decryptedMessage);
}
```

***

### encryptThenPrepareCommitTx()

> **encryptThenPrepareCommitTx**(`ctx`, `params`, `options?`): `Promise`\<[`FlowResult`](#flowresult)\<[`EncryptThenCommitResult`](#encryptthencommitresult)\>\>

Defined in: [flows/encrypt-commit.ts:81](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/encrypt-commit.ts#L81)

Encrypt data and prepare a transaction to store it on-chain

This flow:
1. Encrypts the plaintext using the blackbox
2. Validates the encrypted data sizes
3. Builds a transaction intent for storing the commitment

Note: This flow returns a transaction intent that you can execute
with your own wallet/provider.

#### Parameters

##### ctx

[`FlowContext`](#flowcontext)

Flow context

##### params

[`EncryptThenCommitParams`](#encryptthencommitparams)

Encryption and commitment parameters

##### options?

[`FlowOptions`](#flowoptions)

Flow options

#### Returns

`Promise`\<[`FlowResult`](#flowresult)\<[`EncryptThenCommitResult`](#encryptthencommitresult)\>\>

Flow result with encrypted data and transaction intent

#### Example

```typescript
const result = await encryptThenPrepareCommitTx(ctx, {
  secretId: 123n,
  plaintext: 'My secret data',
  key: keccak256('my-key'),
  commitmentContract: '0x...',
});

if (result.success) {
  // Execute the transaction
  const hash = await wallet.sendTransaction(result.data.txIntent);
  console.log('Commitment stored:', hash);
}
```

***

### encryptFileJobFlow()

> **encryptFileJobFlow**(`ctx`, `params`, `options?`): `Promise`\<[`FlowResult`](#flowresult)\<[`EncryptFileFlowResult`](#encryptfileflowresult)\>\>

Defined in: [flows/file-jobs.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L57)

Encrypt a file and download the result

This flow:
1. Uploads the file for encryption
2. Polls until the job completes
3. Downloads the encrypted result

#### Parameters

##### ctx

[`FlowContext`](#flowcontext)

Flow context

##### params

[`EncryptFileFlowParams`](#encryptfileflowparams)

Encryption parameters

##### options?

[`FlowOptions`](#flowoptions)

Flow options

#### Returns

`Promise`\<[`FlowResult`](#flowresult)\<[`EncryptFileFlowResult`](#encryptfileflowresult)\>\>

Flow result with encrypted file

***

### decryptFileJobFlow()

> **decryptFileJobFlow**(`ctx`, `params`, `options?`): `Promise`\<[`FlowResult`](#flowresult)\<[`DecryptFileFlowResult`](#decryptfileflowresult)\>\>

Defined in: [flows/file-jobs.ts:213](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L213)

Decrypt a file and download the result

This flow:
1. Uploads the encrypted file for decryption
2. Polls until the job completes
3. Downloads the decrypted result (requires auth)

#### Parameters

##### ctx

[`FlowContext`](#flowcontext)

Flow context

##### params

[`DecryptFileFlowParams`](#decryptfileflowparams)

Decryption parameters

##### options?

[`FlowOptions`](#flowoptions)

Flow options

#### Returns

`Promise`\<[`FlowResult`](#flowresult)\<[`DecryptFileFlowResult`](#decryptfileflowresult)\>\>

Flow result with decrypted file

***

### decryptExistingFileJobFlow()

> **decryptExistingFileJobFlow**(`ctx`, `params`, `options?`): `Promise`\<[`FlowResult`](#flowresult)\<[`DecryptFileFlowResult`](#decryptfileflowresult)\>\>

Defined in: [flows/file-jobs.ts:356](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/flows/file-jobs.ts#L356)

Decrypt from an existing encrypt job and download the result

This flow:
1. Creates a decrypt job from the existing encrypt job
2. Polls until the job completes
3. Downloads the decrypted result (requires auth)

#### Parameters

##### ctx

[`FlowContext`](#flowcontext)

##### params

[`DecryptExistingFileFlowParams`](#decryptexistingfileflowparams)

##### options?

[`FlowOptions`](#flowoptions)

#### Returns

`Promise`\<[`FlowResult`](#flowresult)\<[`DecryptFileFlowResult`](#decryptfileflowresult)\>\>
