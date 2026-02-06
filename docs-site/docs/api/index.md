**cifer-sdk API Reference v0.3.0-rc.2**

***

# cifer-sdk API Reference v0.3.0-rc.2

CIFER SDK - Cryptographic Infrastructure for Encrypted Records.

This SDK provides a complete toolkit for working with the CIFER encryption
system, which offers quantum-resistant encryption using ML-KEM-768 key
encapsulation and AES-GCM symmetric encryption.

## Main Features

- **keyManagement**: Secret creation, delegation, and ownership management
- **blackbox**: Payload and file encryption/decryption via the blackbox API
- **commitments**: On-chain encrypted data storage and retrieval
- **flows**: High-level orchestrated operations

## Getting Started

## Examples

```typescript
import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';

// Create the SDK instance with auto-discovery
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Connect any EIP-1193 wallet
const signer = new Eip1193SignerAdapter(window.ethereum);

// Get chain configuration
const chainId = 752025;
const controllerAddress = sdk.getControllerAddress(chainId);

// Read operations
const fee = await sdk.keyManagement.getSecretCreationFee({
  chainId,
  controllerAddress,
  readClient: sdk.readClient,
});

// Build transactions (execute with your wallet)
const txIntent = sdk.keyManagement.buildCreateSecretTx({
  chainId,
  controllerAddress,
  fee,
});

// Execute with your preferred method
const hash = await wallet.sendTransaction(txIntent);
```

```typescript
import { blackbox } from 'cifer-sdk';

// Encrypt a payload
const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My secret message',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

// Decrypt the payload
const decrypted = await blackbox.payload.decryptPayload({
  chainId: 752025,
  secretId: 123n,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

console.log(decrypted.decryptedMessage); // 'My secret message'
```

## Namespaces

- [blackbox](cifer-sdk-API-Reference/namespaces/blackbox/index.md)
- [commitments](cifer-sdk-API-Reference/namespaces/commitments.md)
- [flows](cifer-sdk-API-Reference/namespaces/flows.md)
- [keyManagement](cifer-sdk-API-Reference/namespaces/keyManagement.md)

## Classes

### Eip1193SignerAdapter

Defined in: [internal/adapters/eip1193-signer.ts:37](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/eip1193-signer.ts#L37)

Signer adapter for EIP-1193 compatible providers

This adapter works with any EIP-1193 provider including:
- MetaMask (window.ethereum)
- WalletConnect
- Coinbase Wallet
- Any wagmi connector

#### Example

```typescript
// Browser with MetaMask
const signer = new Eip1193SignerAdapter(window.ethereum);

// With wagmi
const provider = await connector.getProvider();
const signer = new Eip1193SignerAdapter(provider);

// Usage
const address = await signer.getAddress();
const signature = await signer.signMessage('Hello, CIFER!');
```

#### Implements

- [`SignerAdapter`](#signeradapter)

#### Constructors

##### Constructor

> **new Eip1193SignerAdapter**(`provider`): [`Eip1193SignerAdapter`](#eip1193signeradapter)

Defined in: [internal/adapters/eip1193-signer.ts:46](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/eip1193-signer.ts#L46)

Create a new EIP-1193 signer adapter

###### Parameters

###### provider

[`Eip1193Provider`](#eip1193provider)

An EIP-1193 compatible provider

###### Returns

[`Eip1193SignerAdapter`](#eip1193signeradapter)

#### Methods

##### getAddress()

> **getAddress**(): `Promise`\<`` `0x${string}` ``\>

Defined in: [internal/adapters/eip1193-signer.ts:59](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/eip1193-signer.ts#L59)

Get the address of the connected account

Uses eth_accounts to get the currently connected account.
Caches the result for subsequent calls.

###### Returns

`Promise`\<`` `0x${string}` ``\>

The checksummed address

###### Throws

AuthError if no account is connected

###### Implementation of

[`SignerAdapter`](#signeradapter).[`getAddress`](#getaddress-2)

##### signMessage()

> **signMessage**(`message`): `Promise`\<`` `0x${string}` ``\>

Defined in: [internal/adapters/eip1193-signer.ts:106](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/eip1193-signer.ts#L106)

Sign a message using personal_sign (EIP-191)

This is the signing method expected by the blackbox for authentication.

###### Parameters

###### message

`string`

The message to sign (raw string, not hashed)

###### Returns

`Promise`\<`` `0x${string}` ``\>

The signature as a hex string

###### Implementation of

[`SignerAdapter`](#signeradapter).[`signMessage`](#signmessage-2)

##### sendTransaction()

> **sendTransaction**(`txRequest`): `Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

Defined in: [internal/adapters/eip1193-signer.ts:137](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/eip1193-signer.ts#L137)

Optional: Send a transaction via the provider

This is an opt-in convenience method. Apps can use this to execute
TxIntent objects directly, or they can handle transaction submission
themselves using their preferred method.

###### Parameters

###### txRequest

[`TxIntent`](#txintent)

The transaction intent to send

###### Returns

`Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

Transaction hash and wait function

###### Implementation of

[`SignerAdapter`](#signeradapter).[`sendTransaction`](#sendtransaction-2)

##### clearCache()

> **clearCache**(): `void`

Defined in: [internal/adapters/eip1193-signer.ts:235](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/eip1193-signer.ts#L235)

Clear the cached address

Call this when the user disconnects or switches accounts.

###### Returns

`void`

***

### RpcReadClient

Defined in: [internal/adapters/rpc-read-client.ts:61](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/rpc-read-client.ts#L61)

RPC read client for making blockchain queries

This client makes standard JSON-RPC calls to Ethereum-compatible nodes.
It supports multiple chains by mapping chain IDs to RPC URLs.

#### Example

```typescript
const readClient = new RpcReadClient({
  rpcUrlByChainId: {
    752025: 'https://mainnet.ternoa.network',
    11155111: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
  },
});

const blockNumber = await readClient.getBlockNumber(752025);
const logs = await readClient.getLogs(752025, {
  address: '0x...',
  fromBlock: 1000,
  toBlock: 'latest',
});
```

#### Implements

- [`ReadClient`](#readclient-1)

#### Constructors

##### Constructor

> **new RpcReadClient**(`config`): [`RpcReadClient`](#rpcreadclient)

Defined in: [internal/adapters/rpc-read-client.ts:71](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/rpc-read-client.ts#L71)

Create a new RPC read client

###### Parameters

###### config

[`RpcReadClientConfig`](#rpcreadclientconfig)

Configuration with RPC URLs per chain

###### Returns

[`RpcReadClient`](#rpcreadclient)

#### Methods

##### setRpcUrl()

> **setRpcUrl**(`chainId`, `rpcUrl`): `void`

Defined in: [internal/adapters/rpc-read-client.ts:82](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/rpc-read-client.ts#L82)

Add or update an RPC URL for a chain

###### Parameters

###### chainId

`number`

The chain ID

###### rpcUrl

`string`

The RPC URL

###### Returns

`void`

##### getBlockNumber()

> **getBlockNumber**(`chainId`): `Promise`\<`number`\>

Defined in: [internal/adapters/rpc-read-client.ts:92](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/rpc-read-client.ts#L92)

Get the current block number for a chain

###### Parameters

###### chainId

`number`

The chain ID

###### Returns

`Promise`\<`number`\>

The current block number

###### Implementation of

[`ReadClient`](#readclient-1).[`getBlockNumber`](#getblocknumber-2)

##### getLogs()

> **getLogs**(`chainId`, `filter`): `Promise`\<[`Log`](#log)[]\>

Defined in: [internal/adapters/rpc-read-client.ts:104](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/rpc-read-client.ts#L104)

Get logs matching a filter

###### Parameters

###### chainId

`number`

The chain ID

###### filter

[`LogFilter`](#logfilter)

The log filter

###### Returns

`Promise`\<[`Log`](#log)[]\>

Array of matching logs

###### Implementation of

[`ReadClient`](#readclient-1).[`getLogs`](#getlogs-2)

##### call()

> **call**(`chainId`, `callRequest`): `Promise`\<`` `0x${string}` ``\>

Defined in: [internal/adapters/rpc-read-client.ts:151](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/rpc-read-client.ts#L151)

Make an eth_call to read contract state

###### Parameters

###### chainId

`number`

The chain ID

###### callRequest

[`CallRequest`](#callrequest)

The call request

###### Returns

`Promise`\<`` `0x${string}` ``\>

The return data as a hex string

###### Implementation of

[`ReadClient`](#readclient-1).[`call`](#call-2)

***

### CiferError

Defined in: [internal/errors/index.ts:44](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L44)

Base error class for all CIFER SDK errors.

#### Remarks

All SDK errors extend this class. Use [isCiferError](#iscifererror) to check
if an unknown error is a CIFER SDK error.

#### Extends

- `Error`

#### Extended by

- [`ConfigError`](#configerror)
- [`AuthError`](#autherror)
- [`BlackboxError`](#blackboxerror)
- [`KeyManagementError`](#keymanagementerror)
- [`CommitmentsError`](#commitmentserror)
- [`FlowError`](#flowerror)

#### Constructors

##### Constructor

> **new CiferError**(`message`, `code`, `cause?`): [`CiferError`](#cifererror)

Defined in: [internal/errors/index.ts:69](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L69)

Create a new CIFER error.

###### Parameters

###### message

`string`

Human-readable error message

###### code

`string`

Error code for programmatic handling

###### cause?

`Error`

Original error that caused this error

###### Returns

[`CiferError`](#cifererror)

###### Overrides

`Error.constructor`

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

***

### ConfigError

Defined in: [internal/errors/index.ts:94](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L94)

Error thrown when SDK configuration is invalid or missing.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`DiscoveryError`](#discoveryerror)
- [`ChainNotSupportedError`](#chainnotsupportederror)

#### Constructors

##### Constructor

> **new ConfigError**(`message`, `cause?`): [`ConfigError`](#configerror)

Defined in: [internal/errors/index.ts:99](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L99)

###### Parameters

###### message

`string`

Description of the configuration problem

###### cause?

`Error`

Original error if this wraps another error

###### Returns

[`ConfigError`](#configerror)

###### Overrides

[`CiferError`](#cifererror).[`constructor`](#constructor-2)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CiferError`](#cifererror).[`code`](#code)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### DiscoveryError

Defined in: [internal/errors/index.ts:114](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L114)

Error thrown when discovery fails.

#### Remarks

This error is thrown when the SDK cannot fetch configuration from
the blackbox `/healthz` endpoint.

#### Extends

- [`ConfigError`](#configerror)

#### Constructors

##### Constructor

> **new DiscoveryError**(`message`, `blackboxUrl`, `cause?`): [`DiscoveryError`](#discoveryerror)

Defined in: [internal/errors/index.ts:123](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L123)

###### Parameters

###### message

`string`

Description of the discovery failure

###### blackboxUrl

`string`

The URL that was attempted

###### cause?

`Error`

Original network or parsing error

###### Returns

[`DiscoveryError`](#discoveryerror)

###### Overrides

[`ConfigError`](#configerror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`ConfigError`](#configerror).[`code`](#code-1)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`ConfigError`](#configerror).[`cause`](#cause-1)

##### blackboxUrl

> `readonly` **blackboxUrl**: `string`

Defined in: [internal/errors/index.ts:116](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L116)

The blackbox URL that failed

***

### ChainNotSupportedError

Defined in: [internal/errors/index.ts:135](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L135)

Error thrown when a chain is not supported or not configured.

#### Extends

- [`ConfigError`](#configerror)

#### Constructors

##### Constructor

> **new ChainNotSupportedError**(`chainId`, `cause?`): [`ChainNotSupportedError`](#chainnotsupportederror)

Defined in: [internal/errors/index.ts:143](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L143)

###### Parameters

###### chainId

`number`

The unsupported chain ID

###### cause?

`Error`

Original error if this wraps another error

###### Returns

[`ChainNotSupportedError`](#chainnotsupportederror)

###### Overrides

[`ConfigError`](#configerror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`ConfigError`](#configerror).[`code`](#code-1)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`ConfigError`](#configerror).[`cause`](#cause-1)

##### chainId

> `readonly` **chainId**: `number`

Defined in: [internal/errors/index.ts:137](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L137)

The chain ID that is not supported

***

### AuthError

Defined in: [internal/errors/index.ts:159](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L159)

Error thrown when authentication or signing fails.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`SignatureError`](#signatureerror)
- [`BlockStaleError`](#blockstaleerror)
- [`SignerMismatchError`](#signermismatcherror)

#### Constructors

##### Constructor

> **new AuthError**(`message`, `cause?`): [`AuthError`](#autherror)

Defined in: [internal/errors/index.ts:164](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L164)

###### Parameters

###### message

`string`

Description of the authentication failure

###### cause?

`Error`

Original signing or wallet error

###### Returns

[`AuthError`](#autherror)

###### Overrides

[`CiferError`](#cifererror).[`constructor`](#constructor-2)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CiferError`](#cifererror).[`code`](#code)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### SignatureError

Defined in: [internal/errors/index.ts:175](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L175)

Error thrown when signature verification fails.

#### Extends

- [`AuthError`](#autherror)

#### Constructors

##### Constructor

> **new SignatureError**(`message`, `cause?`): [`SignatureError`](#signatureerror)

Defined in: [internal/errors/index.ts:180](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L180)

###### Parameters

###### message

`string`

Description of the signature problem

###### cause?

`Error`

Original verification error

###### Returns

[`SignatureError`](#signatureerror)

###### Overrides

[`AuthError`](#autherror).[`constructor`](#constructor-6)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`AuthError`](#autherror).[`code`](#code-4)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`AuthError`](#autherror).[`cause`](#cause-4)

***

### BlockStaleError

Defined in: [internal/errors/index.ts:197](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L197)

Error thrown when block number is stale (outside the freshness window).

#### Remarks

The blackbox requires signatures to include a recent block number to
prevent replay attacks. If the block is too old, this error is thrown.

The SDK automatically retries with a fresh block number (up to 3 times).

#### Extends

- [`AuthError`](#autherror)

#### Constructors

##### Constructor

> **new BlockStaleError**(`blockNumber`, `currentBlock`, `maxWindow`, `cause?`): [`BlockStaleError`](#blockstaleerror)

Defined in: [internal/errors/index.ts:211](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L211)

###### Parameters

###### blockNumber

`number`

The stale block number that was used

###### currentBlock

`number`

The current block number on-chain

###### maxWindow

`number`

Maximum allowed block difference

###### cause?

`Error`

Original error from the server

###### Returns

[`BlockStaleError`](#blockstaleerror)

###### Overrides

[`AuthError`](#autherror).[`constructor`](#constructor-6)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`AuthError`](#autherror).[`code`](#code-4)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`AuthError`](#autherror).[`cause`](#cause-4)

##### blockNumber

> `readonly` **blockNumber**: `number`

Defined in: [internal/errors/index.ts:199](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L199)

The block number that was used in the signature

##### currentBlock

> `readonly` **currentBlock**: `number`

Defined in: [internal/errors/index.ts:201](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L201)

The current block number on-chain when the error occurred

##### maxWindow

> `readonly` **maxWindow**: `number`

Defined in: [internal/errors/index.ts:203](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L203)

The maximum allowed difference (typically ~100 blocks / 10 minutes)

***

### SignerMismatchError

Defined in: [internal/errors/index.ts:233](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L233)

Error thrown when signer address doesn't match expected.

#### Extends

- [`AuthError`](#autherror)

#### Constructors

##### Constructor

> **new SignerMismatchError**(`expected`, `actual`, `cause?`): [`SignerMismatchError`](#signermismatcherror)

Defined in: [internal/errors/index.ts:244](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L244)

###### Parameters

###### expected

`string`

Expected signer address

###### actual

`string`

Actual signer address recovered from signature

###### cause?

`Error`

Original verification error

###### Returns

[`SignerMismatchError`](#signermismatcherror)

###### Overrides

[`AuthError`](#autherror).[`constructor`](#constructor-6)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`AuthError`](#autherror).[`code`](#code-4)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`AuthError`](#autherror).[`cause`](#cause-4)

##### expected

> `readonly` **expected**: `string`

Defined in: [internal/errors/index.ts:235](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L235)

The expected signer address

##### actual

> `readonly` **actual**: `string`

Defined in: [internal/errors/index.ts:237](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L237)

The actual signer address

***

### BlackboxError

Defined in: [internal/errors/index.ts:261](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L261)

Error thrown when a blackbox API call fails.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`EncryptionError`](#encryptionerror)
- [`DecryptionError`](#decryptionerror)
- [`JobError`](#joberror)
- [`SecretNotReadyError`](#secretnotreadyerror)

#### Constructors

##### Constructor

> **new BlackboxError**(`message`, `options?`): [`BlackboxError`](#blackboxerror)

Defined in: [internal/errors/index.ts:271](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L271)

###### Parameters

###### message

`string`

Error message from the server or description

###### options?

Additional error details

###### statusCode?

`number`

###### endpoint?

`string`

###### cause?

`Error`

###### Returns

[`BlackboxError`](#blackboxerror)

###### Overrides

[`CiferError`](#cifererror).[`constructor`](#constructor-2)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CiferError`](#cifererror).[`code`](#code)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

***

### EncryptionError

Defined in: [internal/errors/index.ts:287](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L287)

Error thrown when encryption fails.

#### Extends

- [`BlackboxError`](#blackboxerror)

#### Constructors

##### Constructor

> **new EncryptionError**(`message`, `cause?`): [`EncryptionError`](#encryptionerror)

Defined in: [internal/errors/index.ts:292](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L292)

###### Parameters

###### message

`string`

Description of the encryption failure

###### cause?

`Error`

Original error from the blackbox

###### Returns

[`EncryptionError`](#encryptionerror)

###### Overrides

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-10)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`BlackboxError`](#blackboxerror).[`code`](#code-8)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

***

### DecryptionError

Defined in: [internal/errors/index.ts:303](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L303)

Error thrown when decryption fails.

#### Extends

- [`BlackboxError`](#blackboxerror)

#### Constructors

##### Constructor

> **new DecryptionError**(`message`, `cause?`): [`DecryptionError`](#decryptionerror)

Defined in: [internal/errors/index.ts:308](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L308)

###### Parameters

###### message

`string`

Description of the decryption failure

###### cause?

`Error`

Original error from the blackbox

###### Returns

[`DecryptionError`](#decryptionerror)

###### Overrides

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-10)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`BlackboxError`](#blackboxerror).[`code`](#code-8)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

***

### JobError

Defined in: [internal/errors/index.ts:319](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L319)

Error thrown when a job operation fails.

#### Extends

- [`BlackboxError`](#blackboxerror)

#### Constructors

##### Constructor

> **new JobError**(`message`, `jobId`, `cause?`): [`JobError`](#joberror)

Defined in: [internal/errors/index.ts:328](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L328)

###### Parameters

###### message

`string`

Description of the job failure

###### jobId

`string`

The ID of the failed job

###### cause?

`Error`

Original error from the blackbox

###### Returns

[`JobError`](#joberror)

###### Overrides

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-10)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`BlackboxError`](#blackboxerror).[`code`](#code-8)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

##### jobId

> `readonly` **jobId**: `string`

Defined in: [internal/errors/index.ts:321](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L321)

The job ID that failed

***

### SecretNotReadyError

Defined in: [internal/errors/index.ts:345](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L345)

Error thrown when a secret is not ready (still syncing).

#### Remarks

After creating a secret, it takes some time for the enclave cluster
to generate and sync the key material. During this time, the secret
cannot be used for encryption or decryption.

#### Extends

- [`BlackboxError`](#blackboxerror)

#### Constructors

##### Constructor

> **new SecretNotReadyError**(`secretId`, `cause?`): [`SecretNotReadyError`](#secretnotreadyerror)

Defined in: [internal/errors/index.ts:353](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L353)

###### Parameters

###### secretId

`bigint`

The ID of the secret that is still syncing

###### cause?

`Error`

Original error from the server

###### Returns

[`SecretNotReadyError`](#secretnotreadyerror)

###### Overrides

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-10)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`BlackboxError`](#blackboxerror).[`code`](#code-8)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

##### secretId

> `readonly` **secretId**: `bigint`

Defined in: [internal/errors/index.ts:347](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L347)

The secret ID that is not ready

***

### KeyManagementError

Defined in: [internal/errors/index.ts:369](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L369)

Error thrown when a key management operation fails.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`SecretNotFoundError`](#secretnotfounderror)
- [`NotAuthorizedError`](#notauthorizederror)

#### Constructors

##### Constructor

> **new KeyManagementError**(`message`, `cause?`): [`KeyManagementError`](#keymanagementerror)

Defined in: [internal/errors/index.ts:374](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L374)

###### Parameters

###### message

`string`

Description of the operation failure

###### cause?

`Error`

Original RPC or contract error

###### Returns

[`KeyManagementError`](#keymanagementerror)

###### Overrides

[`CiferError`](#cifererror).[`constructor`](#constructor-2)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CiferError`](#cifererror).[`code`](#code)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### SecretNotFoundError

Defined in: [internal/errors/index.ts:385](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L385)

Error thrown when a secret is not found.

#### Extends

- [`KeyManagementError`](#keymanagementerror)

#### Constructors

##### Constructor

> **new SecretNotFoundError**(`secretId`, `cause?`): [`SecretNotFoundError`](#secretnotfounderror)

Defined in: [internal/errors/index.ts:393](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L393)

###### Parameters

###### secretId

`bigint`

The ID that was not found

###### cause?

`Error`

Original contract error

###### Returns

[`SecretNotFoundError`](#secretnotfounderror)

###### Overrides

[`KeyManagementError`](#keymanagementerror).[`constructor`](#constructor-15)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`KeyManagementError`](#keymanagementerror).[`code`](#code-13)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`KeyManagementError`](#keymanagementerror).[`cause`](#cause-13)

##### secretId

> `readonly` **secretId**: `bigint`

Defined in: [internal/errors/index.ts:387](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L387)

The secret ID that was not found

***

### NotAuthorizedError

Defined in: [internal/errors/index.ts:405](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L405)

Error thrown when caller is not authorized for a secret operation.

#### Extends

- [`KeyManagementError`](#keymanagementerror)

#### Constructors

##### Constructor

> **new NotAuthorizedError**(`secretId`, `caller`, `cause?`): [`NotAuthorizedError`](#notauthorizederror)

Defined in: [internal/errors/index.ts:416](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L416)

###### Parameters

###### secretId

`bigint`

The secret ID

###### caller

`string`

The address that tried to perform the operation

###### cause?

`Error`

Original contract error

###### Returns

[`NotAuthorizedError`](#notauthorizederror)

###### Overrides

[`KeyManagementError`](#keymanagementerror).[`constructor`](#constructor-15)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`KeyManagementError`](#keymanagementerror).[`code`](#code-13)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`KeyManagementError`](#keymanagementerror).[`cause`](#cause-13)

##### secretId

> `readonly` **secretId**: `bigint`

Defined in: [internal/errors/index.ts:407](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L407)

The secret ID

##### caller

> `readonly` **caller**: `string`

Defined in: [internal/errors/index.ts:409](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L409)

The caller address that is not authorized

***

### CommitmentsError

Defined in: [internal/errors/index.ts:433](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L433)

Error thrown when a commitment operation fails.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`CommitmentNotFoundError`](#commitmentnotfounderror)
- [`IntegrityError`](#integrityerror)
- [`InvalidCiferSizeError`](#invalidcifersizeerror)
- [`PayloadTooLargeError`](#payloadtoolargeerror)

#### Constructors

##### Constructor

> **new CommitmentsError**(`message`, `cause?`): [`CommitmentsError`](#commitmentserror)

Defined in: [internal/errors/index.ts:438](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L438)

###### Parameters

###### message

`string`

Description of the operation failure

###### cause?

`Error`

Original RPC or contract error

###### Returns

[`CommitmentsError`](#commitmentserror)

###### Overrides

[`CiferError`](#cifererror).[`constructor`](#constructor-2)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CiferError`](#cifererror).[`code`](#code)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### CommitmentNotFoundError

Defined in: [internal/errors/index.ts:449](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L449)

Error thrown when commitment data is not found.

#### Extends

- [`CommitmentsError`](#commitmentserror)

#### Constructors

##### Constructor

> **new CommitmentNotFoundError**(`dataId`, `cause?`): [`CommitmentNotFoundError`](#commitmentnotfounderror)

Defined in: [internal/errors/index.ts:457](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L457)

###### Parameters

###### dataId

`string`

The data ID (bytes32) that was not found

###### cause?

`Error`

Original error

###### Returns

[`CommitmentNotFoundError`](#commitmentnotfounderror)

###### Overrides

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-18)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`code`](#code-16)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### dataId

> `readonly` **dataId**: `string`

Defined in: [internal/errors/index.ts:451](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L451)

The data ID that was not found

***

### IntegrityError

Defined in: [internal/errors/index.ts:474](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L474)

Error thrown when commitment integrity check fails.

#### Remarks

This indicates that the data retrieved from logs does not match
the hashes stored on-chain. This could indicate data corruption
or tampering.

#### Extends

- [`CommitmentsError`](#commitmentserror)

#### Constructors

##### Constructor

> **new IntegrityError**(`field`, `expectedHash`, `actualHash`, `cause?`): [`IntegrityError`](#integrityerror)

Defined in: [internal/errors/index.ts:488](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L488)

###### Parameters

###### field

The field that failed integrity check

`"cifer"` | `"encryptedMessage"`

###### expectedHash

`string`

Hash from on-chain metadata

###### actualHash

`string`

Hash computed from retrieved data

###### cause?

`Error`

Original error

###### Returns

[`IntegrityError`](#integrityerror)

###### Overrides

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-18)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`code`](#code-16)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### field

> `readonly` **field**: `"cifer"` \| `"encryptedMessage"`

Defined in: [internal/errors/index.ts:476](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L476)

Which field failed verification ('cifer' or 'encryptedMessage')

##### expectedHash

> `readonly` **expectedHash**: `string`

Defined in: [internal/errors/index.ts:478](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L478)

Expected hash from on-chain metadata

##### actualHash

> `readonly` **actualHash**: `string`

Defined in: [internal/errors/index.ts:480](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L480)

Actual hash computed from retrieved data

***

### InvalidCiferSizeError

Defined in: [internal/errors/index.ts:513](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L513)

Error thrown when cifer size is invalid.

#### Remarks

The CIFER envelope must be exactly 1104 bytes (ML-KEM-768 ciphertext + AES-GCM tag).

#### Extends

- [`CommitmentsError`](#commitmentserror)

#### Constructors

##### Constructor

> **new InvalidCiferSizeError**(`actualSize`, `expectedSize`, `cause?`): [`InvalidCiferSizeError`](#invalidcifersizeerror)

Defined in: [internal/errors/index.ts:524](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L524)

###### Parameters

###### actualSize

`number`

Actual size of the cifer data

###### expectedSize

`number`

Expected size (1104 bytes)

###### cause?

`Error`

Original error

###### Returns

[`InvalidCiferSizeError`](#invalidcifersizeerror)

###### Overrides

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-18)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`code`](#code-16)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### actualSize

> `readonly` **actualSize**: `number`

Defined in: [internal/errors/index.ts:515](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L515)

The actual size in bytes

##### expectedSize

> `readonly` **expectedSize**: `number`

Defined in: [internal/errors/index.ts:517](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L517)

The expected size in bytes (1104)

***

### PayloadTooLargeError

Defined in: [internal/errors/index.ts:543](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L543)

Error thrown when encrypted message is too large.

#### Remarks

The maximum payload size is 16KB (16384 bytes) for on-chain commitments.

#### Extends

- [`CommitmentsError`](#commitmentserror)

#### Constructors

##### Constructor

> **new PayloadTooLargeError**(`actualSize`, `maxSize`, `cause?`): [`PayloadTooLargeError`](#payloadtoolargeerror)

Defined in: [internal/errors/index.ts:554](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L554)

###### Parameters

###### actualSize

`number`

Actual size of the encrypted message

###### maxSize

`number`

Maximum allowed size

###### cause?

`Error`

Original error

###### Returns

[`PayloadTooLargeError`](#payloadtoolargeerror)

###### Overrides

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-18)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`code`](#code-16)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### actualSize

> `readonly` **actualSize**: `number`

Defined in: [internal/errors/index.ts:545](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L545)

The actual size in bytes

##### maxSize

> `readonly` **maxSize**: `number`

Defined in: [internal/errors/index.ts:547](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L547)

The maximum allowed size in bytes (16384)

***

### FlowError

Defined in: [internal/errors/index.ts:574](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L574)

Error thrown when a flow operation fails.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`FlowAbortedError`](#flowabortederror)
- [`FlowTimeoutError`](#flowtimeouterror)

#### Constructors

##### Constructor

> **new FlowError**(`message`, `flowName`, `stepName?`, `cause?`): [`FlowError`](#flowerror)

Defined in: [internal/errors/index.ts:586](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L586)

###### Parameters

###### message

`string`

Description of the failure

###### flowName

`string`

Name of the flow that failed

###### stepName?

`string`

Name of the step that failed (optional)

###### cause?

`Error`

Original error from the failed step

###### Returns

[`FlowError`](#flowerror)

###### Overrides

[`CiferError`](#cifererror).[`constructor`](#constructor-2)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`CiferError`](#cifererror).[`code`](#code)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

##### flowName

> `readonly` **flowName**: `string`

Defined in: [internal/errors/index.ts:576](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L576)

The flow that failed (e.g., 'createSecretAndWaitReady')

##### stepName?

> `readonly` `optional` **stepName**: `string`

Defined in: [internal/errors/index.ts:578](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L578)

The step that failed (if applicable)

***

### FlowAbortedError

Defined in: [internal/errors/index.ts:608](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L608)

Error thrown when a flow is aborted.

#### Remarks

Flows can be aborted by passing an `AbortSignal` to the flow context.
When the signal is aborted, this error is thrown.

#### Extends

- [`FlowError`](#flowerror)

#### Constructors

##### Constructor

> **new FlowAbortedError**(`flowName`, `stepName?`, `cause?`): [`FlowAbortedError`](#flowabortederror)

Defined in: [internal/errors/index.ts:614](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L614)

###### Parameters

###### flowName

`string`

Name of the aborted flow

###### stepName?

`string`

Step where abort was detected (optional)

###### cause?

`Error`

Original abort error

###### Returns

[`FlowAbortedError`](#flowabortederror)

###### Overrides

[`FlowError`](#flowerror).[`constructor`](#constructor-23)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`FlowError`](#flowerror).[`code`](#code-21)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`FlowError`](#flowerror).[`cause`](#cause-21)

##### flowName

> `readonly` **flowName**: `string`

Defined in: [internal/errors/index.ts:576](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L576)

The flow that failed (e.g., 'createSecretAndWaitReady')

###### Inherited from

[`FlowError`](#flowerror).[`flowName`](#flowname)

##### stepName?

> `readonly` `optional` **stepName**: `string`

Defined in: [internal/errors/index.ts:578](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L578)

The step that failed (if applicable)

###### Inherited from

[`FlowError`](#flowerror).[`stepName`](#stepname)

***

### FlowTimeoutError

Defined in: [internal/errors/index.ts:625](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L625)

Error thrown when a flow times out.

#### Extends

- [`FlowError`](#flowerror)

#### Constructors

##### Constructor

> **new FlowTimeoutError**(`flowName`, `timeoutMs`, `stepName?`, `cause?`): [`FlowTimeoutError`](#flowtimeouterror)

Defined in: [internal/errors/index.ts:635](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L635)

###### Parameters

###### flowName

`string`

Name of the flow that timed out

###### timeoutMs

`number`

Timeout duration in milliseconds

###### stepName?

`string`

Step where timeout occurred (optional)

###### cause?

`Error`

Original timeout error

###### Returns

[`FlowTimeoutError`](#flowtimeouterror)

###### Overrides

[`FlowError`](#flowerror).[`constructor`](#constructor-23)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L57)

Error code for programmatic handling.

###### Remarks

Possible codes:
- `CONFIG_ERROR` - Configuration or discovery errors
- `AUTH_ERROR` - Authentication and signing errors
- `BLACKBOX_ERROR` - Blackbox API errors
- `KEY_MANAGEMENT_ERROR` - SecretsController errors
- `COMMITMENTS_ERROR` - On-chain commitment errors
- `FLOW_ERROR` - Flow execution errors

###### Inherited from

[`FlowError`](#flowerror).[`code`](#code-21)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`FlowError`](#flowerror).[`cause`](#cause-21)

##### flowName

> `readonly` **flowName**: `string`

Defined in: [internal/errors/index.ts:576](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L576)

The flow that failed (e.g., 'createSecretAndWaitReady')

###### Inherited from

[`FlowError`](#flowerror).[`flowName`](#flowname)

##### stepName?

> `readonly` `optional` **stepName**: `string`

Defined in: [internal/errors/index.ts:578](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L578)

The step that failed (if applicable)

###### Inherited from

[`FlowError`](#flowerror).[`stepName`](#stepname)

##### timeoutMs

> `readonly` **timeoutMs**: `number`

Defined in: [internal/errors/index.ts:627](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L627)

Timeout in milliseconds

## Interfaces

### CiferSdk

Defined in: [index.ts:222](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L222)

CIFER SDK instance.

Provides access to all SDK functionality through organized namespaces
and helper methods for chain configuration.

#### Remarks

Create an instance using [createCiferSdk](#createcifersdk) (async with discovery)
or [createCiferSdkSync](#createcifersdksync) (sync without discovery).

#### Properties

##### keyManagement

> `readonly` **keyManagement**: [`keyManagement`](cifer-sdk-API-Reference/namespaces/keyManagement.md)

Defined in: [index.ts:230](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L230)

Key management operations (SecretsController).

###### Remarks

Provides functions for reading secret state, building transaction
intents, and parsing events.

##### blackbox

> `readonly` **blackbox**: [`blackbox`](cifer-sdk-API-Reference/namespaces/blackbox/index.md)

Defined in: [index.ts:238](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L238)

Blackbox API operations (encryption/decryption).

###### Remarks

Provides namespaces for payload, file, and job operations.

##### commitments

> `readonly` **commitments**: [`commitments`](cifer-sdk-API-Reference/namespaces/commitments.md)

Defined in: [index.ts:247](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L247)

On-chain commitment operations.

###### Remarks

Provides functions for reading, storing, and verifying encrypted
commitments on-chain.

##### flows

> `readonly` **flows**: [`flows`](cifer-sdk-API-Reference/namespaces/flows.md)

Defined in: [index.ts:256](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L256)

High-level orchestrated flows.

###### Remarks

Provides complete workflows for common operations like creating
secrets, encrypting data, and decrypting from logs.

##### blackboxUrl

> `readonly` **blackboxUrl**: `string`

Defined in: [index.ts:261](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L261)

The configured blackbox URL.

##### discovery

> `readonly` **discovery**: [`DiscoveryResult`](#discoveryresult) \| `null`

Defined in: [index.ts:266](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L266)

The discovery result (null if discovery was not performed).

##### signer?

> `readonly` `optional` **signer**: [`SignerAdapter`](#signeradapter)

Defined in: [index.ts:271](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L271)

The default signer (if configured).

##### readClient

> `readonly` **readClient**: [`ReadClient`](#readclient-1)

Defined in: [index.ts:276](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L276)

The default read client.

#### Methods

##### getControllerAddress()

> **getControllerAddress**(`chainId`): `` `0x${string}` ``

Defined in: [index.ts:285](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L285)

Get the SecretsController address for a chain.

###### Parameters

###### chainId

`number`

The chain ID

###### Returns

`` `0x${string}` ``

The SecretsController contract address

###### Throws

[ConfigError](#configerror) When no address is configured for the chain

##### getRpcUrl()

> **getRpcUrl**(`chainId`): `string`

Defined in: [index.ts:294](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L294)

Get the RPC URL for a chain.

###### Parameters

###### chainId

`number`

The chain ID

###### Returns

`string`

The RPC URL

###### Throws

[ConfigError](#configerror) When no RPC URL is configured for the chain

##### getSupportedChainIds()

> **getSupportedChainIds**(): `number`[]

Defined in: [index.ts:301](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L301)

Get supported chain IDs.

###### Returns

`number`[]

Array of supported chain IDs

##### refreshDiscovery()

> **refreshDiscovery**(): `Promise`\<`void`\>

Defined in: [index.ts:312](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L312)

Refresh discovery (re-fetch /healthz).

###### Returns

`Promise`\<`void`\>

###### Remarks

Call this to update chain configuration after changes on the server.

###### Throws

[ConfigError](#configerror) When called on an SDK created without blackboxUrl

###### Throws

[DiscoveryError](#discoveryerror) When the discovery request fails

***

### SignerAdapter

Defined in: [types/adapters.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L57)

Minimal signer adapter interface for wallet abstraction.

This interface abstracts away the wallet implementation, allowing the SDK
to work with any EIP-1193 compatible wallet (MetaMask, WalletConnect, etc.)
as well as server-side signers.

#### Remarks

The SDK provides a built-in [Eip1193SignerAdapter](#eip1193signeradapter) that implements this
interface for standard EIP-1193 providers.

#### Examples

```typescript
import { Eip1193SignerAdapter } from 'cifer-sdk/adapters';

const signer = new Eip1193SignerAdapter(window.ethereum);
const address = await signer.getAddress();
const signature = await signer.signMessage('Hello, CIFER!');
```

```typescript
const customSigner: SignerAdapter = {
  async getAddress() {
    return myWallet.address;
  },
  async signMessage(message) {
    return myWallet.personalSign(message);
  },
};
```

#### Methods

##### getAddress()

> **getAddress**(): `Promise`\<`` `0x${string}` ``\>

Defined in: [types/adapters.ts:65](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L65)

Get the address of the signer.

###### Returns

`Promise`\<`` `0x${string}` ``\>

A promise resolving to the checksummed Ethereum address

###### Throws

[AuthError](#autherror) When the wallet is not connected or no accounts are available

##### signMessage()

> **signMessage**(`message`): `Promise`\<`` `0x${string}` ``\>

Defined in: [types/adapters.ts:82](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L82)

Sign a message using EIP-191 personal_sign semantics.

###### Parameters

###### message

`string`

The raw message string to sign (NOT hashed or prefixed)

###### Returns

`Promise`\<`` `0x${string}` ``\>

A promise resolving to the signature as a hex string

###### Remarks

This is used for blackbox authentication where the server expects
signatures that can be verified with standard `ecrecover` after
applying the EIP-191 prefix.

The message should NOT be pre-hashed or prefixed by the caller.

###### Throws

[AuthError](#autherror) When signing fails or is rejected by the user

##### sendTransaction()?

> `optional` **sendTransaction**(`txRequest`): `Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

Defined in: [types/adapters.ts:99](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L99)

Optional: Send a transaction.

###### Parameters

###### txRequest

[`TxIntent`](#txintent)

The transaction intent to send

###### Returns

`Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

A promise resolving to the transaction hash and a wait function

###### Remarks

This is an opt-in convenience method. Core SDK flows work without it
by returning [TxIntent](#txintent) objects that the app broadcasts themselves.

Implementing this allows the SDK's flow execution mode to submit
transactions directly.

###### Throws

[AuthError](#autherror) When the transaction fails to submit

***

### CallRequest

Defined in: [types/adapters.ts:107](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L107)

Call request for making eth_call.

#### Properties

##### to

> **to**: `` `0x${string}` ``

Defined in: [types/adapters.ts:109](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L109)

Contract address to call

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/adapters.ts:111](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L111)

Encoded calldata

##### blockTag?

> `optional` **blockTag**: `number` \| `"pending"` \| `"latest"`

Defined in: [types/adapters.ts:113](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L113)

Block tag or number (default: 'latest')

***

### ReadClient

Defined in: [types/adapters.ts:142](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L142)

Minimal read client interface for RPC abstraction.

This interface abstracts away the RPC implementation, allowing the SDK
to work with any RPC provider or custom implementations.

#### Remarks

The SDK provides a built-in [RpcReadClient](#rpcreadclient) that implements this
interface using standard JSON-RPC calls.

#### Example

```typescript
import { RpcReadClient } from 'cifer-sdk/adapters';

const readClient = new RpcReadClient({
  rpcUrlByChainId: {
    752025: 'https://mainnet.ternoa.network',
    11155111: 'https://eth-sepolia.g.alchemy.com/v2/...',
  },
});

const blockNumber = await readClient.getBlockNumber(752025);
```

#### Methods

##### getBlockNumber()

> **getBlockNumber**(`chainId`): `Promise`\<`number`\>

Defined in: [types/adapters.ts:151](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L151)

Get the current block number for a chain.

###### Parameters

###### chainId

`number`

The chain ID to query

###### Returns

`Promise`\<`number`\>

A promise resolving to the current block number

###### Throws

[AuthError](#autherror) When the RPC call fails

##### getLogs()

> **getLogs**(`chainId`, `filter`): `Promise`\<[`Log`](#log)[]\>

Defined in: [types/adapters.ts:162](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L162)

Get logs matching a filter.

###### Parameters

###### chainId

`number`

The chain ID to query

###### filter

[`LogFilter`](#logfilter)

The log filter criteria

###### Returns

`Promise`\<[`Log`](#log)[]\>

A promise resolving to an array of matching logs

###### Throws

[CommitmentsError](#commitmentserror) When the RPC call fails

##### call()?

> `optional` **call**(`chainId`, `callRequest`): `Promise`\<`` `0x${string}` ``\>

Defined in: [types/adapters.ts:178](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L178)

Optional: Make an eth_call for reading contract state.

###### Parameters

###### chainId

`number`

The chain ID to query

###### callRequest

[`CallRequest`](#callrequest)

The call request with target address and calldata

###### Returns

`Promise`\<`` `0x${string}` ``\>

A promise resolving to the return data as a hex string

###### Remarks

Used for reading contract state. If not provided, operations that
require contract reads will fail with an error indicating the
method is not available.

###### Throws

[KeyManagementError](#keymanagementerror) or [CommitmentsError](#commitmentserror) When the call fails

***

### Eip1193Provider

Defined in: [types/adapters.ts:192](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L192)

EIP-1193 provider interface (minimal subset).

#### Remarks

This is the standard interface for Ethereum providers as specified in EIP-1193.
Most wallets (MetaMask, WalletConnect, Coinbase Wallet, etc.) implement this.

#### See

[EIP-1193 Specification](https://eips.ethereum.org/EIPS/eip-1193)

#### Methods

##### request()

> **request**(`args`): `Promise`\<`unknown`\>

Defined in: [types/adapters.ts:199](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L199)

Make a JSON-RPC request.

###### Parameters

###### args

The request arguments including method and params

###### method

`string`

###### params?

`unknown`[]

###### Returns

`Promise`\<`unknown`\>

A promise resolving to the response

***

### RpcReadClientConfig

Defined in: [types/adapters.ts:210](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L210)

Configuration for the RpcReadClient.

#### Properties

##### rpcUrlByChainId

> **rpcUrlByChainId**: `Record`\<[`ChainId`](#chainid-1), `string`\>

Defined in: [types/adapters.ts:222](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L222)

Map of chain IDs to RPC URLs.

###### Example

```typescript
{
  752025: 'https://mainnet.ternoa.network',
  11155111: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
}
```

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/adapters.ts:230](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/adapters.ts#L230)

Optional: Custom fetch implementation.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

###### Remarks

Useful for testing or environments without native fetch.

***

### Log

Defined in: [types/common.ts:138](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L138)

Represents an EVM log entry from a transaction receipt.

#### Remarks

Logs are used to retrieve encrypted commitment data that is emitted
in events rather than stored directly in contract storage.

#### Properties

##### address

> **address**: `` `0x${string}` ``

Defined in: [types/common.ts:140](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L140)

Contract address that emitted the log

##### topics

> **topics**: `` `0x${string}` ``[]

Defined in: [types/common.ts:142](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L142)

Array of indexed topics (topic[0] is the event signature)

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/common.ts:144](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L144)

Non-indexed data (ABI-encoded)

##### blockNumber

> **blockNumber**: `number`

Defined in: [types/common.ts:146](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L146)

Block number where log was emitted

##### transactionHash

> **transactionHash**: `` `0x${string}` ``

Defined in: [types/common.ts:148](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L148)

Transaction hash

##### logIndex

> **logIndex**: `number`

Defined in: [types/common.ts:150](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L150)

Log index within the block

##### transactionIndex

> **transactionIndex**: `number`

Defined in: [types/common.ts:152](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L152)

Transaction index within the block

***

### LogFilter

Defined in: [types/common.ts:163](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L163)

Filter for querying logs via eth_getLogs.

#### Remarks

Used with [ReadClient.getLogs](#getlogs-2) to retrieve event logs from the blockchain.

#### Properties

##### address?

> `optional` **address**: `` `0x${string}` ``

Defined in: [types/common.ts:165](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L165)

Contract address to filter by

##### topics?

> `optional` **topics**: (`` `0x${string}` `` \| `null`)[]

Defined in: [types/common.ts:167](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L167)

Topics to filter by (null for wildcard at that position)

##### fromBlock?

> `optional` **fromBlock**: `number` \| `"latest"`

Defined in: [types/common.ts:169](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L169)

Start block (inclusive)

##### toBlock?

> `optional` **toBlock**: `number` \| `"latest"`

Defined in: [types/common.ts:171](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L171)

End block (inclusive)

***

### TransactionReceipt

Defined in: [types/common.ts:179](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L179)

Transaction receipt returned after a transaction is mined.

#### Properties

##### transactionHash

> **transactionHash**: `` `0x${string}` ``

Defined in: [types/common.ts:181](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L181)

Transaction hash

##### blockNumber

> **blockNumber**: `number`

Defined in: [types/common.ts:183](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L183)

Block number where transaction was included

##### contractAddress?

> `optional` **contractAddress**: `` `0x${string}` ``

Defined in: [types/common.ts:185](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L185)

Contract address if this was a contract creation

##### status

> **status**: `0` \| `1`

Defined in: [types/common.ts:187](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L187)

Status (1 = success, 0 = failure/revert)

##### gasUsed

> **gasUsed**: `bigint`

Defined in: [types/common.ts:189](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L189)

Gas used by this transaction

##### logs

> **logs**: [`Log`](#log)[]

Defined in: [types/common.ts:191](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L191)

Logs emitted by this transaction

***

### SecretState

Defined in: [types/common.ts:208](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L208)

Secret state as stored on-chain in the SecretsController contract.

#### Remarks

This represents the complete state of a secret including ownership,
delegation, synchronization status, and the public key location.

A secret is ready for use when:
- `isSyncing` is `false`
- `publicKeyCid` is non-empty
- `secretType` is `1` (standard encryption)

#### Properties

##### owner

> **owner**: `` `0x${string}` ``

Defined in: [types/common.ts:210](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L210)

Owner address of the secret (can transfer, set delegate, decrypt)

##### delegate

> **delegate**: `` `0x${string}` ``

Defined in: [types/common.ts:212](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L212)

Delegate address (can decrypt on owner's behalf, zero address if none)

##### isSyncing

> **isSyncing**: `boolean`

Defined in: [types/common.ts:214](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L214)

Whether the secret is still syncing (not ready for use)

##### clusterId

> **clusterId**: `number`

Defined in: [types/common.ts:216](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L216)

Cluster ID where the secret's private key shards are stored

##### secretType

> **secretType**: `number`

Defined in: [types/common.ts:218](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L218)

Secret type (1 = standard ML-KEM-768 encryption)

##### publicKeyCid

> **publicKeyCid**: `string`

Defined in: [types/common.ts:220](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L220)

IPFS CID of the public key (empty string if still syncing)

***

### CIFERMetadata

Defined in: [types/common.ts:233](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L233)

CIFER metadata stored on-chain for encrypted commitments.

#### Remarks

This metadata is stored in contract storage and used to:
- Locate the block where encrypted data was emitted
- Verify integrity of retrieved data via hash comparison

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [types/common.ts:235](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L235)

Secret ID used for encryption

##### storedAtBlock

> **storedAtBlock**: `number`

Defined in: [types/common.ts:237](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L237)

Block number when data was stored/updated

##### ciferHash

> **ciferHash**: `` `0x${string}` ``

Defined in: [types/common.ts:239](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L239)

keccak256 hash of the cifer bytes

##### encryptedMessageHash

> **encryptedMessageHash**: `` `0x${string}` ``

Defined in: [types/common.ts:241](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L241)

keccak256 hash of the encrypted message bytes

***

### CommitmentData

Defined in: [types/common.ts:253](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L253)

Encrypted commitment data retrieved from event logs.

#### Remarks

This data is emitted in `CIFERDataStored` or `CIFERDataUpdated` events
and must be retrieved from logs to decrypt the content.

#### Properties

##### cifer

> **cifer**: `` `0x${string}` ``

Defined in: [types/common.ts:255](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L255)

The CIFER envelope bytes (exactly 1104 bytes: ML-KEM ciphertext + AES-GCM tag)

##### encryptedMessage

> **encryptedMessage**: `` `0x${string}` ``

Defined in: [types/common.ts:257](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L257)

The AES-GCM encrypted message bytes (variable length, max 16KB)

##### ciferHash

> **ciferHash**: `` `0x${string}` ``

Defined in: [types/common.ts:259](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L259)

keccak256(cifer) - for integrity verification

##### encryptedMessageHash

> **encryptedMessageHash**: `` `0x${string}` ``

Defined in: [types/common.ts:261](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L261)

keccak256(encryptedMessage) - for integrity verification

***

### JobInfo

Defined in: [types/common.ts:273](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L273)

Job information returned by the blackbox.

#### Remarks

File encryption and decryption operations are asynchronous. This interface
represents the state of a job at any point in its lifecycle.

#### Properties

##### id

> **id**: `string`

Defined in: [types/common.ts:275](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L275)

Unique job identifier (UUID)

##### type

> **type**: [`JobType`](#jobtype)

Defined in: [types/common.ts:277](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L277)

Type of job (encrypt or decrypt)

##### status

> **status**: [`JobStatus`](#jobstatus)

Defined in: [types/common.ts:279](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L279)

Current status

##### progress

> **progress**: `number`

Defined in: [types/common.ts:281](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L281)

Progress percentage (0-100)

##### secretId

> **secretId**: `number`

Defined in: [types/common.ts:283](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L283)

Secret ID used for this job

##### chainId

> **chainId**: `number`

Defined in: [types/common.ts:285](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L285)

Chain ID

##### createdAt

> **createdAt**: `number`

Defined in: [types/common.ts:287](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L287)

Unix timestamp (ms) when job was created

##### completedAt?

> `optional` **completedAt**: `number`

Defined in: [types/common.ts:289](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L289)

Unix timestamp (ms) when job completed (if completed)

##### expiredAt?

> `optional` **expiredAt**: `number`

Defined in: [types/common.ts:291](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L291)

Unix timestamp (ms) when job will expire

##### error?

> `optional` **error**: `string`

Defined in: [types/common.ts:293](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L293)

Error message if job failed

##### resultFileName?

> `optional` **resultFileName**: `string`

Defined in: [types/common.ts:295](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L295)

Result filename for download

##### ttl

> **ttl**: `number`

Defined in: [types/common.ts:297](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L297)

Time-to-live in milliseconds

##### originalSize?

> `optional` **originalSize**: `number`

Defined in: [types/common.ts:299](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L299)

Original file size in bytes

***

### DataConsumption

Defined in: [types/common.ts:311](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L311)

Data consumption/usage statistics for a wallet.

#### Remarks

The blackbox tracks encryption and decryption usage per wallet
for rate limiting and billing purposes.

#### Properties

##### wallet

> **wallet**: `` `0x${string}` ``

Defined in: [types/common.ts:313](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L313)

Wallet address

##### encryption

> **encryption**: `object`

Defined in: [types/common.ts:315](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L315)

Encryption usage statistics

###### limit

> **limit**: `number`

Limit in bytes

###### used

> **used**: `number`

Used in bytes

###### remaining

> **remaining**: `number`

Remaining in bytes

###### count

> **count**: `number`

Number of encryption operations

###### limitGB

> **limitGB**: `number`

Limit in GB

###### usedGB

> **usedGB**: `number`

Used in GB

###### remainingGB

> **remainingGB**: `number`

Remaining in GB

##### decryption

> **decryption**: `object`

Defined in: [types/common.ts:332](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L332)

Decryption usage statistics

###### limit

> **limit**: `number`

Limit in bytes

###### used

> **used**: `number`

Used in bytes

###### remaining

> **remaining**: `number`

Remaining in bytes

###### count

> **count**: `number`

Number of decryption operations

###### limitGB

> **limitGB**: `number`

Limit in GB

###### usedGB

> **usedGB**: `number`

Used in GB

###### remainingGB

> **remainingGB**: `number`

Remaining in GB

***

### ChainConfig

Defined in: [types/config.ts:26](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L26)

Per-chain configuration from discovery or overrides.

#### Remarks

Chain configuration can come from:
1. Discovery (fetched from blackbox `/healthz` endpoint)
2. Explicit overrides provided in SDK configuration

Overrides take precedence over discovery values.

#### Extended by

- [`ResolvedChainConfig`](#resolvedchainconfig)

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [types/config.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L28)

Chain ID

##### name?

> `optional` **name**: `string`

Defined in: [types/config.ts:30](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L30)

Human-readable chain name (e.g., 'Ternoa Mainnet')

##### rpcUrl

> **rpcUrl**: `string`

Defined in: [types/config.ts:32](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L32)

HTTP RPC URL for this chain

##### wsRpcUrl?

> `optional` **wsRpcUrl**: `string`

Defined in: [types/config.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L34)

WebSocket RPC URL for this chain (optional, for subscriptions)

##### secretsControllerAddress

> **secretsControllerAddress**: `` `0x${string}` ``

Defined in: [types/config.ts:36](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L36)

SecretsController contract address on this chain

##### blockTimeMs?

> `optional` **blockTimeMs**: `number`

Defined in: [types/config.ts:38](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L38)

Block time in milliseconds (used for timeout calculations)

***

### DiscoveryResult

Defined in: [types/config.ts:54](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L54)

Result of calling the blackbox /healthz endpoint.

#### Remarks

Discovery provides runtime configuration including:
- Supported chains and their RPC URLs
- Contract addresses
- Service status

This allows the SDK to work without hardcoded configuration.

#### Properties

##### status

> **status**: `string`

Defined in: [types/config.ts:56](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L56)

Status of the blackbox service ('ok' when healthy)

##### enclaveWalletAddress

> **enclaveWalletAddress**: `` `0x${string}` ``

Defined in: [types/config.ts:58](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L58)

Enclave wallet address used by the blackbox for on-chain verification

##### supportedChains

> **supportedChains**: `number`[]

Defined in: [types/config.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L60)

List of supported chain IDs

##### chains

> **chains**: [`ChainConfig`](#chainconfig)[]

Defined in: [types/config.ts:62](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L62)

Per-chain configuration

##### ipfsGatewayUrl?

> `optional` **ipfsGatewayUrl**: `string`

Defined in: [types/config.ts:64](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L64)

IPFS gateway URL for fetching public keys

##### fetchedAt

> **fetchedAt**: `number`

Defined in: [types/config.ts:66](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L66)

Unix timestamp (ms) when this discovery result was fetched

***

### CiferSdkConfig

Defined in: [types/config.ts:105](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L105)

SDK configuration options.

#### Remarks

The SDK can be configured in several ways:

1. **Discovery mode** (recommended): Provide `blackboxUrl` and the SDK
   will fetch configuration from the `/healthz` endpoint.

2. **Manual mode**: Provide `chainOverrides` with explicit configuration
   for each chain you want to use.

3. **Hybrid mode**: Use discovery with selective overrides for specific
   chains (e.g., custom RPC URLs).

#### Examples

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  chainOverrides: {
    752025: {
      rpcUrl: 'https://my-private-rpc.example.com',
    },
  },
});
```

#### Properties

##### blackboxUrl?

> `optional` **blackboxUrl**: `string`

Defined in: [types/config.ts:116](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L116)

Blackbox URL (e.g., 'https://cifer-blackbox.ternoa.dev:3010').

###### Remarks

If provided, the SDK will perform discovery by calling the `/healthz`
endpoint to fetch chain configurations automatically.

If not provided, the SDK will require explicit chain configs
via `chainOverrides` for all operations.

##### signer?

> `optional` **signer**: [`SignerAdapter`](#signeradapter)

Defined in: [types/config.ts:125](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L125)

Default signer adapter to use for signing operations.

###### Remarks

Can be overridden per-call. If not provided, each operation
that requires signing must receive a signer explicitly.

##### readClient?

> `optional` **readClient**: [`ReadClient`](#readclient-1)

Defined in: [types/config.ts:134](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L134)

Default read client for RPC operations.

###### Remarks

Can be overridden per-call. If not provided, the SDK will
create a read client using RPC URLs from discovery.

##### chainOverrides?

> `optional` **chainOverrides**: `Record`\<`number`, `Partial`\<[`ChainConfig`](#chainconfig)\>\>

Defined in: [types/config.ts:158](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L158)

Chain configuration overrides.

###### Remarks

Use this to override discovery results or provide configuration
for private deployments / offline usage.

Override values are merged with discovery values, with overrides
taking precedence.

###### Example

```typescript
{
  chainOverrides: {
    752025: {
      rpcUrl: 'https://my-private-rpc.example.com',
      secretsControllerAddress: '0x...',
    },
  },
}
```

##### discoveryCacheTtlMs?

> `optional` **discoveryCacheTtlMs**: `number`

Defined in: [types/config.ts:168](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L168)

Discovery cache TTL in milliseconds.

###### Remarks

Discovery results are cached in memory to avoid repeated network calls.

###### Default Value

```ts
300000 (5 minutes)
```

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/config.ts:176](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L176)

Custom fetch implementation.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

###### Remarks

Useful for testing or environments without native fetch.

##### logger()?

> `optional` **logger**: (`message`) => `void`

Defined in: [types/config.ts:191](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L191)

Logger function for debugging.

###### Parameters

###### message

`string`

###### Returns

`void`

###### Remarks

Called with progress messages during SDK operations.

###### Example

```typescript
{
  logger: console.log,
}
```

***

### ResolvedChainConfig

Defined in: [types/config.ts:202](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L202)

Resolved configuration for a specific chain.

#### Remarks

This extends [ChainConfig](#chainconfig) with metadata about the configuration source.

#### Extends

- [`ChainConfig`](#chainconfig)

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [types/config.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L28)

Chain ID

###### Inherited from

[`ChainConfig`](#chainconfig).[`chainId`](#chainid-3)

##### name?

> `optional` **name**: `string`

Defined in: [types/config.ts:30](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L30)

Human-readable chain name (e.g., 'Ternoa Mainnet')

###### Inherited from

[`ChainConfig`](#chainconfig).[`name`](#name)

##### rpcUrl

> **rpcUrl**: `string`

Defined in: [types/config.ts:32](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L32)

HTTP RPC URL for this chain

###### Inherited from

[`ChainConfig`](#chainconfig).[`rpcUrl`](#rpcurl)

##### wsRpcUrl?

> `optional` **wsRpcUrl**: `string`

Defined in: [types/config.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L34)

WebSocket RPC URL for this chain (optional, for subscriptions)

###### Inherited from

[`ChainConfig`](#chainconfig).[`wsRpcUrl`](#wsrpcurl)

##### secretsControllerAddress

> **secretsControllerAddress**: `` `0x${string}` ``

Defined in: [types/config.ts:36](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L36)

SecretsController contract address on this chain

###### Inherited from

[`ChainConfig`](#chainconfig).[`secretsControllerAddress`](#secretscontrolleraddress)

##### blockTimeMs?

> `optional` **blockTimeMs**: `number`

Defined in: [types/config.ts:38](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L38)

Block time in milliseconds (used for timeout calculations)

###### Inherited from

[`ChainConfig`](#chainconfig).[`blockTimeMs`](#blocktimems)

##### fromDiscovery

> **fromDiscovery**: `boolean`

Defined in: [types/config.ts:204](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L204)

Whether this config came from discovery (true) or overrides only (false)

***

### SdkContext

Defined in: [types/config.ts:216](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L216)

**`Internal`**

Internal SDK context passed to domain modules.

#### Remarks

This is an internal type used to pass configuration and dependencies
between SDK modules. It should not be used directly by SDK consumers.

#### Properties

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/config.ts:218](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L218)

Blackbox base URL

##### discovery

> **discovery**: [`DiscoveryResult`](#discoveryresult) \| `null`

Defined in: [types/config.ts:220](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L220)

Discovery result (may be null if not yet fetched)

##### chainOverrides

> **chainOverrides**: `Record`\<[`ChainId`](#chainid-1), `Partial`\<[`ChainConfig`](#chainconfig)\>\>

Defined in: [types/config.ts:222](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L222)

Chain configuration overrides

##### signer?

> `optional` **signer**: [`SignerAdapter`](#signeradapter)

Defined in: [types/config.ts:224](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L224)

Default signer

##### readClient?

> `optional` **readClient**: [`ReadClient`](#readclient-1)

Defined in: [types/config.ts:226](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L226)

Default read client

##### fetch()

> **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/config.ts:228](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L228)

Fetch implementation

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

##### logger()

> **logger**: (`message`) => `void`

Defined in: [types/config.ts:230](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/config.ts#L230)

Logger

###### Parameters

###### message

`string`

###### Returns

`void`

***

### TxIntent

Defined in: [types/tx-intent.ts:67](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L67)

A transaction intent represents a transaction that can be executed
by any EIP-1193 compatible wallet or transaction executor.

#### Remarks

This is the standard output format for all write operations in the SDK.
The app is responsible for broadcasting the transaction using their
preferred method (wagmi, ethers, viem, direct RPC, etc.).

Transaction intents intentionally do not include:
- `from` address (determined by the wallet)
- Gas settings (handled by the wallet/provider)
- Nonce (managed by the wallet/provider)

#### Examples

```typescript
const intent = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });

const hash = await sendTransaction({
  to: intent.to,
  data: intent.data,
  value: intent.value,
});
```

```typescript
const intent = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });

const tx = await signer.sendTransaction({
  to: intent.to,
  data: intent.data,
  value: intent.value,
});
```

```typescript
const intent = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });

const hash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    to: intent.to,
    data: intent.data,
    value: intent.value ? `0x${intent.value.toString(16)}` : undefined,
  }],
});
```

#### Extended by

- [`TxIntentWithMeta`](#txintentwithmeta)

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [types/tx-intent.ts:75](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L75)

The chain ID where this transaction should be executed.

###### Remarks

Apps should verify the wallet is connected to the correct chain
before submitting the transaction.

##### to

> **to**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:80](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L80)

The recipient address (contract address for contract calls).

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:85](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L85)

The calldata for the transaction (ABI-encoded function call).

##### value?

> `optional` **value**: `bigint`

Defined in: [types/tx-intent.ts:94](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L94)

The value to send with the transaction (in wei).

###### Remarks

Only set for payable functions. For non-payable functions,
this will be `undefined`.

***

### TxIntentWithMeta

Defined in: [types/tx-intent.ts:106](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L106)

Extended transaction intent with additional metadata useful for UX and debugging.

#### Remarks

Transaction builders in the SDK return this extended type which includes
human-readable descriptions and decoded arguments for display purposes.

#### Extends

- [`TxIntent`](#txintent)

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [types/tx-intent.ts:75](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L75)

The chain ID where this transaction should be executed.

###### Remarks

Apps should verify the wallet is connected to the correct chain
before submitting the transaction.

###### Inherited from

[`TxIntent`](#txintent).[`chainId`](#chainid-5)

##### to

> **to**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:80](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L80)

The recipient address (contract address for contract calls).

###### Inherited from

[`TxIntent`](#txintent).[`to`](#to-1)

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:85](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L85)

The calldata for the transaction (ABI-encoded function call).

###### Inherited from

[`TxIntent`](#txintent).[`data`](#data-2)

##### value?

> `optional` **value**: `bigint`

Defined in: [types/tx-intent.ts:94](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L94)

The value to send with the transaction (in wei).

###### Remarks

Only set for payable functions. For non-payable functions,
this will be `undefined`.

###### Inherited from

[`TxIntent`](#txintent).[`value`](#value)

##### description

> **description**: `string`

Defined in: [types/tx-intent.ts:112](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L112)

Human-readable description of what this transaction does.

###### Example

```ts
`'Create a new CIFER secret'`
```

##### functionName

> **functionName**: `string`

Defined in: [types/tx-intent.ts:119](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L119)

The function being called (for display purposes).

###### Example

```ts
`'createSecret'`
```

##### args?

> `optional` **args**: `Record`\<`string`, `unknown`\>

Defined in: [types/tx-intent.ts:128](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L128)

The decoded arguments (for display purposes).

###### Remarks

Arguments are provided as a record for easy display in UIs.
BigInt values are converted to strings for JSON serialization.

***

### TxExecutionResult

Defined in: [types/tx-intent.ts:136](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L136)

Result of executing a transaction intent.

#### Properties

##### hash

> **hash**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:140](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L140)

The transaction hash.

##### waitReceipt()

> **waitReceipt**: () => `Promise`\<[`TransactionReceipt`](#transactionreceipt)\>

Defined in: [types/tx-intent.ts:147](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L147)

Function to wait for the transaction receipt.

###### Returns

`Promise`\<[`TransactionReceipt`](#transactionreceipt)\>

A promise resolving to the transaction receipt

## Type Aliases

### Address

> **Address** = `` `0x${string}` ``

Defined in: [types/common.ts:29](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L29)

Ethereum address (0x-prefixed, 40 hex characters).

#### Remarks

Addresses should be checksummed when displayed to users but are compared
case-insensitively within the SDK.

#### Example

```typescript
const address: Address = '0x1234567890123456789012345678901234567890';
```

***

### Bytes32

> **Bytes32** = `` `0x${string}` ``

Defined in: [types/common.ts:44](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L44)

Bytes32 hex string (0x-prefixed, 64 hex characters).

#### Remarks

Commonly used for keccak256 hashes and mapping keys in smart contracts.

#### Example

```typescript
const hash: Bytes32 = '0x1234567890123456789012345678901234567890123456789012345678901234';
```

***

### Hex

> **Hex** = `` `0x${string}` ``

Defined in: [types/common.ts:55](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L55)

Generic hex string (0x-prefixed).

#### Remarks

Used for arbitrary hex-encoded data such as transaction calldata,
signatures, and encoded messages.

***

### ChainId

> **ChainId** = `number`

Defined in: [types/common.ts:67](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L67)

Chain ID as a number.

#### Remarks

Common chain IDs used with CIFER:
- `752025` - Ternoa Mainnet
- `11155111` - Ethereum Sepolia (testnet)

***

### SecretId

> **SecretId** = `bigint`

Defined in: [types/common.ts:78](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L78)

Secret ID (uint256 on-chain, represented as bigint).

#### Remarks

Secret IDs are auto-incremented by the SecretsController contract
when new secrets are created.

***

### BlockNumber

> **BlockNumber** = `number`

Defined in: [types/common.ts:85](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L85)

Block number.

***

### OutputFormat

> **OutputFormat** = `"hex"` \| `"base64"`

Defined in: [types/common.ts:96](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L96)

Output format for blackbox encryption operations.

#### Remarks

- `'hex'` - Returns data as 0x-prefixed hex strings
- `'base64'` - Returns data as base64 encoded strings

***

### InputFormat

> **InputFormat** = `"hex"` \| `"base64"`

Defined in: [types/common.ts:107](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L107)

Input format for blackbox decryption operations.

#### Remarks

- `'hex'` - Input data is 0x-prefixed hex strings
- `'base64'` - Input data is base64 encoded strings

***

### JobStatus

> **JobStatus** = `"pending"` \| `"processing"` \| `"completed"` \| `"failed"` \| `"expired"`

Defined in: [types/common.ts:120](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L120)

Job status as returned by the blackbox.

#### Remarks

Job lifecycle:
1. `'pending'` - Job created, waiting to be processed
2. `'processing'` - Job is being processed
3. `'completed'` | `'failed'` | `'expired'` - Terminal states

***

### JobType

> **JobType** = `"encrypt"` \| `"decrypt"`

Defined in: [types/common.ts:127](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/common.ts#L127)

Job type as returned by the blackbox.

***

### TxExecutor()

> **TxExecutor** = (`intent`) => `Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

Defined in: [types/tx-intent.ts:175](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/types/tx-intent.ts#L175)

Callback type for executing transaction intents.

#### Parameters

##### intent

[`TxIntent`](#txintent)

#### Returns

`Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

#### Remarks

Apps provide this callback to the SDK's flow execution mode to handle
transaction submission. The callback receives a transaction intent and
should return the hash and a function to wait for the receipt.

#### Example

```typescript
const txExecutor: TxExecutor = async (intent) => {
  const hash = await wallet.sendTransaction({
    to: intent.to,
    data: intent.data,
    value: intent.value,
  });
  return {
    hash,
    waitReceipt: () => provider.waitForTransaction(hash),
  };
};
```

## Variables

### CIFER\_ENCRYPTED\_ABI

> `const` **CIFER\_ENCRYPTED\_ABI**: readonly \[\{ `type`: `"function"`; `name`: `"CIFER_ENVELOPE_BYTES"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"pure"`; \}, \{ `type`: `"function"`; `name`: `"MAX_PAYLOAD_BYTES"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"pure"`; \}, \{ `type`: `"function"`; `name`: `"getCIFERMetadata"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; \}\]; `outputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}, \{ `name`: `"storedAtBlock"`; `type`: `"uint64"`; \}, \{ `name`: `"ciferHash"`; `type`: `"bytes32"`; \}, \{ `name`: `"encryptedMessageHash"`; `type`: `"bytes32"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"ciferDataExists"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; \}\]; `outputs`: readonly \[\{ `name`: `"exists"`; `type`: `"bool"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"event"`; `name`: `"CIFERDataStored"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; `indexed`: `true`; \}, \{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"cifer"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessage"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"ciferHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessageHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"CIFERDataUpdated"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; `indexed`: `true`; \}, \{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"cifer"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessage"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"ciferHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessageHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"CIFERDataDeleted"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; `indexed`: `true`; \}\]; \}\]

Defined in: [internal/abi/cifer-encrypted.ts:17](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/abi/cifer-encrypted.ts#L17)

Minimal ABI fragment for ICiferEncrypted interface

This ABI contains only the stable, common functions and events
that all contracts implementing ICiferEncrypted should have.

***

### CIFER\_ENVELOPE\_BYTES

> `const` **CIFER\_ENVELOPE\_BYTES**: `1104` = `1104`

Defined in: [internal/abi/cifer-encrypted.ts:88](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/abi/cifer-encrypted.ts#L88)

Constants for CIFER envelope sizes

***

### MAX\_PAYLOAD\_BYTES

> `const` **MAX\_PAYLOAD\_BYTES**: `16384` = `16384`

Defined in: [internal/abi/cifer-encrypted.ts:89](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/abi/cifer-encrypted.ts#L89)

***

### SECRETS\_CONTROLLER\_ABI

> `const` **SECRETS\_CONTROLLER\_ABI**: readonly \[\{ `type`: `"function"`; `name`: `"secretCreationFee"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"defaultSecretType"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint8"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"nextSecretId"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretState"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `outputs`: readonly \[\{ `name`: `"owner"`; `type`: `"address"`; \}, \{ `name`: `"delegate"`; `type`: `"address"`; \}, \{ `name`: `"isSyncing"`; `type`: `"bool"`; \}, \{ `name`: `"clusterId"`; `type`: `"uint8"`; \}, \{ `name`: `"secretType"`; `type`: `"uint8"`; \}, \{ `name`: `"publicKeyCid"`; `type`: `"string"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretOwner"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"address"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getDelegate"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"address"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretsByWallet"`; `inputs`: readonly \[\{ `name`: `"wallet"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\{ `name`: `"owned"`; `type`: `"uint256[]"`; \}, \{ `name`: `"delegated"`; `type`: `"uint256[]"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretsCountByWallet"`; `inputs`: readonly \[\{ `name`: `"wallet"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\{ `name`: `"ownedCount"`; `type`: `"uint256"`; \}, \{ `name`: `"delegatedCount"`; `type`: `"uint256"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"createSecret"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `stateMutability`: `"payable"`; \}, \{ `type`: `"function"`; `name`: `"setDelegate"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}, \{ `name`: `"newDelegate"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\]; `stateMutability`: `"nonpayable"`; \}, \{ `type`: `"function"`; `name`: `"transferSecret"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}, \{ `name`: `"newOwner"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\]; `stateMutability`: `"nonpayable"`; \}, \{ `type`: `"event"`; `name`: `"SecretCreated"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"owner"`; `type`: `"address"`; `indexed`: `true`; \}, \{ `name`: `"secretType"`; `type`: `"uint8"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"SecretSynced"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"clusterId"`; `type`: `"uint8"`; `indexed`: `true`; \}, \{ `name`: `"publicKeyCid"`; `type`: `"string"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"DelegateUpdated"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"newDelegate"`; `type`: `"address"`; `indexed`: `true`; \}\]; \}, \{ `type`: `"event"`; `name`: `"SecretOwnershipTransferred"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"oldOwner"`; `type`: `"address"`; `indexed`: `true`; \}, \{ `name`: `"newOwner"`; `type`: `"address"`; `indexed`: `true`; \}\]; \}\]

Defined in: [internal/abi/secrets-controller.ts:12](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/abi/secrets-controller.ts#L12)

SecretsController ABI - user-facing subset for SDK
Excludes admin/internal functions (addWhitelistedBlackBox, markSecretSynced, etc.)

## Functions

### createCiferSdk()

> **createCiferSdk**(`config`): `Promise`\<[`CiferSdk`](#cifersdk)\>

Defined in: [index.ts:349](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L349)

Create a CIFER SDK instance with automatic discovery.

This is the main entry point for the SDK. It performs discovery
(if blackboxUrl is provided) and sets up the default read client.

#### Parameters

##### config

[`CiferSdkConfig`](#cifersdkconfig)

SDK configuration options

#### Returns

`Promise`\<[`CiferSdk`](#cifersdk)\>

A promise resolving to the configured SDK instance

#### Throws

[ConfigError](#configerror) When neither blackboxUrl nor readClient is provided

#### Throws

[DiscoveryError](#discoveryerror) When discovery fails

#### Examples

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  signer: new Eip1193SignerAdapter(window.ethereum),
  chainOverrides: {
    752025: {
      rpcUrl: 'https://my-private-rpc.example.com',
    },
  },
});
```

***

### createCiferSdkSync()

> **createCiferSdkSync**(`config`): [`CiferSdk`](#cifersdk)

Defined in: [index.ts:465](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/index.ts#L465)

Create a CIFER SDK instance synchronously (without discovery).

Use this when you have all configuration available and don't need
to fetch from /healthz. Requires explicit chain configuration.

#### Parameters

##### config

[`CiferSdkConfig`](#cifersdkconfig) & `object`

SDK configuration (must include readClient)

#### Returns

[`CiferSdk`](#cifersdk)

The configured SDK instance

#### Throws

[ConfigError](#configerror) When required configuration is missing

#### Example

```typescript
const sdk = createCiferSdkSync({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  readClient: myReadClient,
  chainOverrides: {
    752025: {
      rpcUrl: 'https://mainnet.ternoa.network',
      secretsControllerAddress: '0x...',
    },
  },
});
```

***

### createReadClientFromDiscovery()

> **createReadClientFromDiscovery**(`chains`): [`RpcReadClient`](#rpcreadclient)

Defined in: [internal/adapters/rpc-read-client.ts:275](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/adapters/rpc-read-client.ts#L275)

Create a read client from discovery result

#### Parameters

##### chains

`object`[]

Array of chain configs from discovery

#### Returns

[`RpcReadClient`](#rpcreadclient)

Configured RpcReadClient

#### Example

```typescript
const discovery = await discover('https://cifer-blackbox.ternoa.dev:3010');
const readClient = createReadClientFromDiscovery(discovery.chains);
```

***

### getFreshBlockNumber()

> **getFreshBlockNumber**(`chainId`, `readClient`): `Promise`\<`number`\>

Defined in: [internal/auth/block-freshness.ts:56](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/block-freshness.ts#L56)

Get a fresh block number for signing

This should be called immediately before signing to ensure the block
number is within the server's freshness window.

#### Parameters

##### chainId

`number`

The chain ID

##### readClient

[`ReadClient`](#readclient-1)

Read client for fetching block number

#### Returns

`Promise`\<`number`\>

The current block number

#### Example

```typescript
const blockNumber = await getFreshBlockNumber(752025, readClient);
const dataString = buildEncryptPayloadDataString({
  chainId: 752025,
  secretId: 123n,
  signer: address,
  blockNumber,
  plaintext: 'secret',
});
```

***

### withBlockFreshRetry()

> **withBlockFreshRetry**\<`T`\>(`fn`, `readClient`, `chainId`, `options?`): `Promise`\<`T`\>

Defined in: [internal/auth/block-freshness.ts:116](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/block-freshness.ts#L116)

Wrap an async function with block freshness retry logic

If the function fails with a BlockStaleError, it will be retried
with a fresh block number. The callback receives a function to
get a fresh block number.

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

(`getFreshBlock`) => `Promise`\<`T`\>

The function to wrap (receives getFreshBlock callback)

##### readClient

[`ReadClient`](#readclient-1)

Read client for fetching block numbers

##### chainId

`number`

The chain ID

##### options?

`RetryOptions`

Retry options

#### Returns

`Promise`\<`T`\>

The result of the function

#### Example

```typescript
const result = await withBlockFreshRetry(
  async (getFreshBlock) => {
    const blockNumber = await getFreshBlock();
    const data = buildEncryptPayloadDataString({
      chainId,
      secretId,
      signer,
      blockNumber,
      plaintext,
    });
    const signature = await signer.signMessage(data);
    return await callBlackbox({ data, signature });
  },
  readClient,
  chainId,
  { maxRetries: 3 }
);
```

***

### buildDataString()

> **buildDataString**(`parts`): `string`

Defined in: [internal/auth/data-string.ts:27](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/data-string.ts#L27)

Build an underscore-delimited data string from parts

This is the core function for constructing blackbox auth payloads.
The exact format depends on the endpoint being called.

#### Parameters

##### parts

`string`[]

Array of string parts to join

#### Returns

`string`

Underscore-delimited string

#### Example

```typescript
// Encrypt payload: chainId_secretId_signer_blockNumber_plainText
const data = buildDataString(['752025', '123', '0xabc...', '4200000', 'my secret']);
// '752025_123_0xabc..._4200000_my secret'
```

***

### buildEncryptPayloadDataString()

> **buildEncryptPayloadDataString**(`params`): `string`

Defined in: [internal/auth/data-string.ts:42](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/data-string.ts#L42)

Build data string for encrypt-payload endpoint

Format: `chainId_secretId_signer_blockNumber_plainText`

Note: plainText may contain underscores - the server reconstructs it
by joining everything after the 4th underscore.

#### Parameters

##### params

Parameters for the data string

###### chainId

`number`

###### secretId

`number` \| `bigint`

###### signer

`string`

###### blockNumber

`number`

###### plaintext

`string`

#### Returns

`string`

The data string to be signed

***

### buildDecryptPayloadDataString()

> **buildDecryptPayloadDataString**(`params`): `string`

Defined in: [internal/auth/data-string.ts:66](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/data-string.ts#L66)

Build data string for decrypt-payload endpoint

Format: `chainId_secretId_signer_blockNumber_encryptedMessage`

#### Parameters

##### params

Parameters for the data string

###### chainId

`number`

###### secretId

`number` \| `bigint`

###### signer

`string`

###### blockNumber

`number`

###### encryptedMessage

`string`

#### Returns

`string`

The data string to be signed

***

### buildFileOperationDataString()

> **buildFileOperationDataString**(`params`): `string`

Defined in: [internal/auth/data-string.ts:90](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/data-string.ts#L90)

Build data string for file operations (encrypt-file, decrypt-file, decrypt-existing-file)

Format: `chainId_secretId_signer_blockNumber`

#### Parameters

##### params

Parameters for the data string

###### chainId

`number`

###### secretId

`number` \| `bigint`

###### signer

`string`

###### blockNumber

`number`

#### Returns

`string`

The data string to be signed

***

### buildJobDownloadDataString()

> **buildJobDownloadDataString**(`params`): `string`

Defined in: [internal/auth/data-string.ts:112](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/data-string.ts#L112)

Build data string for job download

Format: `chainId_secretId_signer_blockNumber_jobId_download`

#### Parameters

##### params

Parameters for the data string

###### chainId

`number`

###### secretId

`number` \| `bigint`

###### signer

`string`

###### blockNumber

`number`

###### jobId

`string`

#### Returns

`string`

The data string to be signed

***

### buildJobDeleteDataString()

> **buildJobDeleteDataString**(`params`): `string`

Defined in: [internal/auth/data-string.ts:137](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/data-string.ts#L137)

Build data string for job delete

Format: `chainId_secretId_signer_blockNumber_jobId_delete`

#### Parameters

##### params

Parameters for the data string

###### chainId

`number`

###### secretId

`number` \| `bigint`

###### signer

`string`

###### blockNumber

`number`

###### jobId

`string`

#### Returns

`string`

The data string to be signed

***

### buildJobsListDataString()

> **buildJobsListDataString**(`params`): `string`

Defined in: [internal/auth/data-string.ts:163](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/data-string.ts#L163)

Build data string for jobs list and data consumption

Format: `chainId_secretId_signer_blockNumber`
(secretId is required in the format but ignored by the server for these endpoints)

#### Parameters

##### params

Parameters for the data string

###### chainId

`number`

###### secretId

`number` \| `bigint`

###### signer

`string`

###### blockNumber

`number`

#### Returns

`string`

The data string to be signed

***

### signDataString()

> **signDataString**(`data`, `signer`): `Promise`\<`SignedData`\>

Defined in: [internal/auth/signer.ts:46](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/auth/signer.ts#L46)

Sign a data string using the provided signer

This uses EIP-191 personal_sign semantics, which is what the blackbox
expects for signature verification.

#### Parameters

##### data

`string`

The data string to sign (NOT hashed or prefixed)

##### signer

[`SignerAdapter`](#signeradapter)

The signer adapter

#### Returns

`Promise`\<`SignedData`\>

The signed data with signature

#### Example

```typescript
const dataString = buildEncryptPayloadDataString({
  chainId: 752025,
  secretId: 123n,
  signer: address,
  blockNumber: 4200000,
  plaintext: 'my secret',
});

const signed = await signDataString(dataString, signerAdapter);
// { data: '752025_123_0xabc..._4200000_my secret', signature: '0x...', signer: '0xabc...' }
```

***

### discover()

> **discover**(`blackboxUrl`, `options?`): `Promise`\<[`DiscoveryResult`](#discoveryresult)\>

Defined in: [internal/config/discovery.ts:71](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/discovery.ts#L71)

Discover blackbox configuration by calling /healthz

This function fetches runtime configuration from the blackbox service,
including supported chains, RPC URLs, and contract addresses.

Results are cached in memory with a configurable TTL.

#### Parameters

##### blackboxUrl

`string`

Base URL of the blackbox service

##### options?

Optional configuration

###### cacheTtlMs?

`number`

Cache TTL in milliseconds (default: 5 minutes)

###### forceRefresh?

`boolean`

Force refresh, bypassing cache

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

Custom fetch implementation

#### Returns

`Promise`\<[`DiscoveryResult`](#discoveryresult)\>

Discovery result with chain configurations

#### Example

```typescript
const discovery = await discover('https://cifer-blackbox.ternoa.dev:3010');

console.log('Supported chains:', discovery.supportedChains);
// [752025, 11155111]

const ternoaConfig = discovery.chains.find(c => c.chainId === 752025);
console.log('Ternoa RPC:', ternoaConfig?.rpcUrl);
```

***

### clearDiscoveryCache()

> **clearDiscoveryCache**(`blackboxUrl?`): `void`

Defined in: [internal/config/discovery.ts:168](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/discovery.ts#L168)

Clear the discovery cache

#### Parameters

##### blackboxUrl?

`string`

If provided, only clear cache for this URL. Otherwise clear all.

#### Returns

`void`

***

### getSupportedChainIds()

> **getSupportedChainIds**(`discovery`): `number`[]

Defined in: [internal/config/discovery.ts:180](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/discovery.ts#L180)

Get supported chain IDs from discovery result

#### Parameters

##### discovery

[`DiscoveryResult`](#discoveryresult)

#### Returns

`number`[]

***

### isChainSupported()

> **isChainSupported**(`discovery`, `chainId`): `boolean`

Defined in: [internal/config/discovery.ts:187](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/discovery.ts#L187)

Check if a chain ID is supported

#### Parameters

##### discovery

[`DiscoveryResult`](#discoveryresult)

##### chainId

`number`

#### Returns

`boolean`

***

### resolveChain()

> **resolveChain**(`chainId`, `discovery`, `overrides?`): [`ResolvedChainConfig`](#resolvedchainconfig)

Defined in: [internal/config/resolver.ts:43](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/resolver.ts#L43)

Resolve chain configuration by merging discovery with overrides

Resolution priority (highest to lowest):
1. Explicit overrides
2. Discovery result

#### Parameters

##### chainId

`number`

The chain ID to resolve configuration for

##### discovery

Discovery result (can be null for override-only mode)

[`DiscoveryResult`](#discoveryresult) | `null`

##### overrides?

`Partial`\<[`ChainConfig`](#chainconfig)\>

Optional chain configuration overrides

#### Returns

[`ResolvedChainConfig`](#resolvedchainconfig)

Resolved chain configuration

#### Example

```typescript
// With discovery
const config = resolveChain(752025, discovery);

// With overrides
const config = resolveChain(752025, discovery, {
  rpcUrl: 'https://my-private-rpc.example.com',
});

// Override-only (no discovery)
const config = resolveChain(752025, null, {
  rpcUrl: 'https://my-rpc.example.com',
  secretsControllerAddress: '0x...',
});
```

***

### resolveAllChains()

> **resolveAllChains**(`discovery`, `overrides?`): `Map`\<`number`, [`ResolvedChainConfig`](#resolvedchainconfig)\>

Defined in: [internal/config/resolver.ts:95](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/resolver.ts#L95)

Resolve all chains from discovery, applying overrides

#### Parameters

##### discovery

[`DiscoveryResult`](#discoveryresult)

##### overrides?

`Record`\<`number`, `Partial`\<[`ChainConfig`](#chainconfig)\>\>

#### Returns

`Map`\<`number`, [`ResolvedChainConfig`](#resolvedchainconfig)\>

***

### getRpcUrl()

> **getRpcUrl**(`chainId`, `discovery`, `overrides?`): `string`

Defined in: [internal/config/resolver.ts:131](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/resolver.ts#L131)

Get the RPC URL for a chain

#### Parameters

##### chainId

`number`

##### discovery

[`DiscoveryResult`](#discoveryresult) | `null`

##### overrides?

`Record`\<`number`, `Partial`\<[`ChainConfig`](#chainconfig)\>\>

#### Returns

`string`

***

### getSecretsControllerAddress()

> **getSecretsControllerAddress**(`chainId`, `discovery`, `overrides?`): `string`

Defined in: [internal/config/resolver.ts:143](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/config/resolver.ts#L143)

Get the SecretsController address for a chain

#### Parameters

##### chainId

`number`

##### discovery

[`DiscoveryResult`](#discoveryresult) | `null`

##### overrides?

`Record`\<`number`, `Partial`\<[`ChainConfig`](#chainconfig)\>\>

#### Returns

`string`

***

### isCiferError()

> **isCiferError**(`error`): `error is CiferError`

Defined in: [internal/errors/index.ts:677](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L677)

Check if an error is a CIFER SDK error.

#### Parameters

##### error

`unknown`

The error to check

#### Returns

`error is CiferError`

`true` if the error is an instance of [CiferError](#cifererror)

#### Example

```typescript
try {
  await sdk.keyManagement.getSecret({ ... }, secretId);
} catch (error) {
  if (isCiferError(error)) {
    console.log('SDK error:', error.code, error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

***

### isBlockStaleError()

> **isBlockStaleError**(`error`): `error is BlockStaleError`

Defined in: [internal/errors/index.ts:689](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L689)

Check if an error indicates a stale block number.

#### Parameters

##### error

`unknown`

The error to check

#### Returns

`error is BlockStaleError`

`true` if the error is an instance of [BlockStaleError](#blockstaleerror)

***

### isSecretNotReadyError()

> **isSecretNotReadyError**(`error`): `error is SecretNotReadyError`

Defined in: [internal/errors/index.ts:701](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L701)

Check if an error indicates the secret is not ready.

#### Parameters

##### error

`unknown`

The error to check

#### Returns

`error is SecretNotReadyError`

`true` if the error is an instance of [SecretNotReadyError](#secretnotreadyerror)

***

### parseBlackboxErrorResponse()

> **parseBlackboxErrorResponse**(`response`, `statusCode`, `endpoint`): [`BlackboxError`](#blackboxerror)

Defined in: [internal/errors/index.ts:722](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/internal/errors/index.ts#L722)

**`Internal`**

Parse a blackbox error response and return the appropriate error.

#### Parameters

##### response

The error response from the blackbox

###### error?

`string`

###### message?

`string`

##### statusCode

`number`

HTTP status code

##### endpoint

`string`

The endpoint that returned the error

#### Returns

[`BlackboxError`](#blackboxerror)

The appropriate typed error

#### Remarks

This function parses error responses from the blackbox API and creates
the appropriate typed error. It handles special patterns like block
freshness errors and secret sync errors.
