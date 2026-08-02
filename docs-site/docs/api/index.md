**cifer-sdk API Reference v0.5.3**

***

# cifer-sdk API Reference v0.5.3

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
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
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
- [web2](cifer-sdk-API-Reference/namespaces/web2/index.md)

## Classes

### Eip1193SignerAdapter

Defined in: [internal/adapters/eip1193-signer.ts:37](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/eip1193-signer.ts#L37)

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

Defined in: [internal/adapters/eip1193-signer.ts:46](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/eip1193-signer.ts#L46)

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

Defined in: [internal/adapters/eip1193-signer.ts:59](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/eip1193-signer.ts#L59)

Get the address of the connected account

Uses eth_accounts to get the currently connected account.
Caches the result for subsequent calls.

###### Returns

`Promise`\<`` `0x${string}` ``\>

The checksummed address

###### Throws

AuthError if no account is connected

###### Implementation of

[`SignerAdapter`](#signeradapter).[`getAddress`](#getaddress-4)

##### signMessage()

> **signMessage**(`message`): `Promise`\<`` `0x${string}` ``\>

Defined in: [internal/adapters/eip1193-signer.ts:106](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/eip1193-signer.ts#L106)

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

[`SignerAdapter`](#signeradapter).[`signMessage`](#signmessage-4)

##### sendTransaction()

> **sendTransaction**(`txRequest`): `Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

Defined in: [internal/adapters/eip1193-signer.ts:137](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/eip1193-signer.ts#L137)

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

Defined in: [internal/adapters/eip1193-signer.ts:235](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/eip1193-signer.ts#L235)

Clear the cached address

Call this when the user disconnects or switches accounts.

###### Returns

`void`

***

### PrivateKeySignerAdapter

Defined in: [internal/adapters/private-key-signer.ts:44](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/private-key-signer.ts#L44)

Signer adapter backed by a raw secp256k1 private key.

This adapter performs EIP-191 `personal_sign` using the provided key,
making it ideal for Web2 session signing where there is no browser
wallet. It can also be used for server-side / backend signing.

#### Remarks

The private key is stored in memory. Users are responsible for
securing it (e.g. never persisting to disk unencrypted).

This adapter uses the `@noble/secp256k1` and `@noble/hashes`
libraries for cryptographic operations.

#### Example

```typescript
import { PrivateKeySignerAdapter } from 'cifer-sdk';

// From an existing hex private key
const signer = new PrivateKeySignerAdapter('0xabc123...');

// Generate a fresh random keypair
const signer = PrivateKeySignerAdapter.generate();

const address = await signer.getAddress();
const signature = await signer.signMessage('Hello');
```

#### Implements

- [`SignerAdapter`](#signeradapter)

#### Constructors

##### Constructor

> **new PrivateKeySignerAdapter**(`privateKeyHex`): [`PrivateKeySignerAdapter`](#privatekeysigneradapter)

Defined in: [internal/adapters/private-key-signer.ts:53](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/private-key-signer.ts#L53)

Create a new private-key signer from a hex-encoded private key.

###### Parameters

###### privateKeyHex

`string`

The private key as a hex string (with or without 0x prefix)

###### Returns

[`PrivateKeySignerAdapter`](#privatekeysigneradapter)

#### Methods

##### generate()

> `static` **generate**(): [`PrivateKeySignerAdapter`](#privatekeysigneradapter)

Defined in: [internal/adapters/private-key-signer.ts:74](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/private-key-signer.ts#L74)

Generate a fresh random private-key signer.

Uses `crypto.getRandomValues` for secure key generation.

###### Returns

[`PrivateKeySignerAdapter`](#privatekeysigneradapter)

A new PrivateKeySignerAdapter with a random private key

##### getPrivateKeyHex()

> **getPrivateKeyHex**(): `string`

Defined in: [internal/adapters/private-key-signer.ts:88](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/private-key-signer.ts#L88)

Get the hex-encoded private key (without 0x prefix).

###### Returns

`string`

The private key as a hex string (no 0x prefix)

###### Remarks

Use with caution. This exposes the raw private key.

##### getAddress()

> **getAddress**(): `Promise`\<`` `0x${string}` ``\>

Defined in: [internal/adapters/private-key-signer.ts:97](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/private-key-signer.ts#L97)

Get the Ethereum address derived from this private key.

###### Returns

`Promise`\<`` `0x${string}` ``\>

The checksummed Ethereum address

###### Implementation of

[`SignerAdapter`](#signeradapter).[`getAddress`](#getaddress-4)

##### signMessage()

> **signMessage**(`message`): `Promise`\<`` `0x${string}` ``\>

Defined in: [internal/adapters/private-key-signer.ts:124](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/private-key-signer.ts#L124)

Sign a message using EIP-191 personal_sign semantics.

###### Parameters

###### message

`string`

The raw message string to sign (NOT hashed or prefixed)

###### Returns

`Promise`\<`` `0x${string}` ``\>

The signature as a hex string

###### Implementation of

[`SignerAdapter`](#signeradapter).[`signMessage`](#signmessage-4)

***

### RpcReadClient

Defined in: [internal/adapters/rpc-read-client.ts:62](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/rpc-read-client.ts#L62)

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

Defined in: [internal/adapters/rpc-read-client.ts:72](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/rpc-read-client.ts#L72)

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

Defined in: [internal/adapters/rpc-read-client.ts:83](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/rpc-read-client.ts#L83)

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

Defined in: [internal/adapters/rpc-read-client.ts:97](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/rpc-read-client.ts#L97)

Get the current block number for a chain.

For Web2 mode (`chainId === WEB2_CHAIN_ID`), returns `Date.now()`
(unix milliseconds) instead of making an RPC call — this is the
timestamp-based freshness value the blackbox expects.

###### Parameters

###### chainId

`number`

The chain ID

###### Returns

`Promise`\<`number`\>

The current block number (or timestamp for Web2)

###### Implementation of

[`ReadClient`](#readclient-1).[`getBlockNumber`](#getblocknumber-2)

##### getLogs()

> **getLogs**(`chainId`, `filter`): `Promise`\<[`Log`](#log)[]\>

Defined in: [internal/adapters/rpc-read-client.ts:112](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/rpc-read-client.ts#L112)

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

Defined in: [internal/adapters/rpc-read-client.ts:159](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/rpc-read-client.ts#L159)

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

Defined in: [internal/errors/index.ts:44](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L44)

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
- [`Web2Error`](#web2error)

#### Constructors

##### Constructor

> **new CiferError**(`message`, `code`, `cause?`): [`CiferError`](#cifererror)

Defined in: [internal/errors/index.ts:69](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L69)

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

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

***

### ConfigError

Defined in: [internal/errors/index.ts:94](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L94)

Error thrown when SDK configuration is invalid or missing.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`DiscoveryError`](#discoveryerror)
- [`ChainNotSupportedError`](#chainnotsupportederror)

#### Constructors

##### Constructor

> **new ConfigError**(`message`, `cause?`): [`ConfigError`](#configerror)

Defined in: [internal/errors/index.ts:99](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L99)

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

[`CiferError`](#cifererror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### DiscoveryError

Defined in: [internal/errors/index.ts:114](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L114)

Error thrown when discovery fails.

#### Remarks

This error is thrown when the SDK cannot fetch configuration from
the blackbox `/healthz` endpoint.

#### Extends

- [`ConfigError`](#configerror)

#### Constructors

##### Constructor

> **new DiscoveryError**(`message`, `blackboxUrl`, `cause?`): [`DiscoveryError`](#discoveryerror)

Defined in: [internal/errors/index.ts:123](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L123)

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

[`ConfigError`](#configerror).[`constructor`](#constructor-4)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`ConfigError`](#configerror).[`cause`](#cause-1)

##### blackboxUrl

> `readonly` **blackboxUrl**: `string`

Defined in: [internal/errors/index.ts:116](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L116)

The blackbox URL that failed

***

### ChainNotSupportedError

Defined in: [internal/errors/index.ts:135](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L135)

Error thrown when a chain is not supported or not configured.

#### Extends

- [`ConfigError`](#configerror)

#### Constructors

##### Constructor

> **new ChainNotSupportedError**(`chainId`, `cause?`): [`ChainNotSupportedError`](#chainnotsupportederror)

Defined in: [internal/errors/index.ts:143](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L143)

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

[`ConfigError`](#configerror).[`constructor`](#constructor-4)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`ConfigError`](#configerror).[`cause`](#cause-1)

##### chainId

> `readonly` **chainId**: `number`

Defined in: [internal/errors/index.ts:137](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L137)

The chain ID that is not supported

***

### AuthError

Defined in: [internal/errors/index.ts:159](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L159)

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

Defined in: [internal/errors/index.ts:164](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L164)

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

[`CiferError`](#cifererror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### SignatureError

Defined in: [internal/errors/index.ts:175](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L175)

Error thrown when signature verification fails.

#### Extends

- [`AuthError`](#autherror)

#### Constructors

##### Constructor

> **new SignatureError**(`message`, `cause?`): [`SignatureError`](#signatureerror)

Defined in: [internal/errors/index.ts:180](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L180)

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

[`AuthError`](#autherror).[`constructor`](#constructor-7)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`AuthError`](#autherror).[`cause`](#cause-4)

***

### BlockStaleError

Defined in: [internal/errors/index.ts:197](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L197)

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

Defined in: [internal/errors/index.ts:211](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L211)

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

[`AuthError`](#autherror).[`constructor`](#constructor-7)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`AuthError`](#autherror).[`cause`](#cause-4)

##### blockNumber

> `readonly` **blockNumber**: `number`

Defined in: [internal/errors/index.ts:199](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L199)

The block number that was used in the signature

##### currentBlock

> `readonly` **currentBlock**: `number`

Defined in: [internal/errors/index.ts:201](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L201)

The current block number on-chain when the error occurred

##### maxWindow

> `readonly` **maxWindow**: `number`

Defined in: [internal/errors/index.ts:203](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L203)

The maximum allowed difference (typically ~100 blocks / 10 minutes)

***

### SignerMismatchError

Defined in: [internal/errors/index.ts:233](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L233)

Error thrown when signer address doesn't match expected.

#### Extends

- [`AuthError`](#autherror)

#### Constructors

##### Constructor

> **new SignerMismatchError**(`expected`, `actual`, `cause?`): [`SignerMismatchError`](#signermismatcherror)

Defined in: [internal/errors/index.ts:244](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L244)

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

[`AuthError`](#autherror).[`constructor`](#constructor-7)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`AuthError`](#autherror).[`cause`](#cause-4)

##### expected

> `readonly` **expected**: `string`

Defined in: [internal/errors/index.ts:235](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L235)

The expected signer address

##### actual

> `readonly` **actual**: `string`

Defined in: [internal/errors/index.ts:237](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L237)

The actual signer address

***

### BlackboxError

Defined in: [internal/errors/index.ts:261](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L261)

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

Defined in: [internal/errors/index.ts:271](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L271)

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

[`CiferError`](#cifererror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

***

### EncryptionError

Defined in: [internal/errors/index.ts:287](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L287)

Error thrown when encryption fails.

#### Extends

- [`BlackboxError`](#blackboxerror)

#### Constructors

##### Constructor

> **new EncryptionError**(`message`, `cause?`): [`EncryptionError`](#encryptionerror)

Defined in: [internal/errors/index.ts:292](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L292)

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

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-11)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

***

### DecryptionError

Defined in: [internal/errors/index.ts:303](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L303)

Error thrown when decryption fails.

#### Extends

- [`BlackboxError`](#blackboxerror)

#### Constructors

##### Constructor

> **new DecryptionError**(`message`, `cause?`): [`DecryptionError`](#decryptionerror)

Defined in: [internal/errors/index.ts:308](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L308)

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

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-11)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

***

### JobError

Defined in: [internal/errors/index.ts:319](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L319)

Error thrown when a job operation fails.

#### Extends

- [`BlackboxError`](#blackboxerror)

#### Constructors

##### Constructor

> **new JobError**(`message`, `jobId`, `cause?`): [`JobError`](#joberror)

Defined in: [internal/errors/index.ts:328](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L328)

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

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-11)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

##### jobId

> `readonly` **jobId**: `string`

Defined in: [internal/errors/index.ts:321](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L321)

The job ID that failed

***

### SecretNotReadyError

Defined in: [internal/errors/index.ts:345](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L345)

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

Defined in: [internal/errors/index.ts:353](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L353)

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

[`BlackboxError`](#blackboxerror).[`constructor`](#constructor-11)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`cause`](#cause-8)

##### statusCode?

> `readonly` `optional` **statusCode**: `number`

Defined in: [internal/errors/index.ts:263](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L263)

HTTP status code (if applicable)

###### Inherited from

[`BlackboxError`](#blackboxerror).[`statusCode`](#statuscode)

##### endpoint?

> `readonly` `optional` **endpoint**: `string`

Defined in: [internal/errors/index.ts:265](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L265)

The endpoint that failed (e.g., '/encrypt-payload')

###### Inherited from

[`BlackboxError`](#blackboxerror).[`endpoint`](#endpoint)

##### secretId

> `readonly` **secretId**: `bigint`

Defined in: [internal/errors/index.ts:347](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L347)

The secret ID that is not ready

***

### KeyManagementError

Defined in: [internal/errors/index.ts:369](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L369)

Error thrown when a key management operation fails.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`SecretNotFoundError`](#secretnotfounderror)
- [`NotAuthorizedError`](#notauthorizederror)

#### Constructors

##### Constructor

> **new KeyManagementError**(`message`, `cause?`): [`KeyManagementError`](#keymanagementerror)

Defined in: [internal/errors/index.ts:374](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L374)

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

[`CiferError`](#cifererror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### SecretNotFoundError

Defined in: [internal/errors/index.ts:385](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L385)

Error thrown when a secret is not found.

#### Extends

- [`KeyManagementError`](#keymanagementerror)

#### Constructors

##### Constructor

> **new SecretNotFoundError**(`secretId`, `cause?`): [`SecretNotFoundError`](#secretnotfounderror)

Defined in: [internal/errors/index.ts:393](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L393)

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

[`KeyManagementError`](#keymanagementerror).[`constructor`](#constructor-16)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`KeyManagementError`](#keymanagementerror).[`cause`](#cause-13)

##### secretId

> `readonly` **secretId**: `bigint`

Defined in: [internal/errors/index.ts:387](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L387)

The secret ID that was not found

***

### NotAuthorizedError

Defined in: [internal/errors/index.ts:405](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L405)

Error thrown when caller is not authorized for a secret operation.

#### Extends

- [`KeyManagementError`](#keymanagementerror)

#### Constructors

##### Constructor

> **new NotAuthorizedError**(`secretId`, `caller`, `cause?`): [`NotAuthorizedError`](#notauthorizederror)

Defined in: [internal/errors/index.ts:416](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L416)

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

[`KeyManagementError`](#keymanagementerror).[`constructor`](#constructor-16)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`KeyManagementError`](#keymanagementerror).[`cause`](#cause-13)

##### secretId

> `readonly` **secretId**: `bigint`

Defined in: [internal/errors/index.ts:407](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L407)

The secret ID

##### caller

> `readonly` **caller**: `string`

Defined in: [internal/errors/index.ts:409](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L409)

The caller address that is not authorized

***

### CommitmentsError

Defined in: [internal/errors/index.ts:433](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L433)

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

Defined in: [internal/errors/index.ts:438](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L438)

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

[`CiferError`](#cifererror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### CommitmentNotFoundError

Defined in: [internal/errors/index.ts:449](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L449)

Error thrown when commitment data is not found.

#### Extends

- [`CommitmentsError`](#commitmentserror)

#### Constructors

##### Constructor

> **new CommitmentNotFoundError**(`dataId`, `cause?`): [`CommitmentNotFoundError`](#commitmentnotfounderror)

Defined in: [internal/errors/index.ts:457](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L457)

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

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-19)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### dataId

> `readonly` **dataId**: `string`

Defined in: [internal/errors/index.ts:451](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L451)

The data ID that was not found

***

### IntegrityError

Defined in: [internal/errors/index.ts:474](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L474)

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

Defined in: [internal/errors/index.ts:488](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L488)

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

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-19)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### field

> `readonly` **field**: `"cifer"` \| `"encryptedMessage"`

Defined in: [internal/errors/index.ts:476](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L476)

Which field failed verification ('cifer' or 'encryptedMessage')

##### expectedHash

> `readonly` **expectedHash**: `string`

Defined in: [internal/errors/index.ts:478](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L478)

Expected hash from on-chain metadata

##### actualHash

> `readonly` **actualHash**: `string`

Defined in: [internal/errors/index.ts:480](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L480)

Actual hash computed from retrieved data

***

### InvalidCiferSizeError

Defined in: [internal/errors/index.ts:513](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L513)

Error thrown when cifer size is invalid.

#### Remarks

The CIFER envelope must be exactly 1104 bytes (ML-KEM-768 ciphertext + AES-GCM tag).

#### Extends

- [`CommitmentsError`](#commitmentserror)

#### Constructors

##### Constructor

> **new InvalidCiferSizeError**(`actualSize`, `expectedSize`, `cause?`): [`InvalidCiferSizeError`](#invalidcifersizeerror)

Defined in: [internal/errors/index.ts:524](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L524)

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

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-19)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### actualSize

> `readonly` **actualSize**: `number`

Defined in: [internal/errors/index.ts:515](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L515)

The actual size in bytes

##### expectedSize

> `readonly` **expectedSize**: `number`

Defined in: [internal/errors/index.ts:517](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L517)

The expected size in bytes (1104)

***

### PayloadTooLargeError

Defined in: [internal/errors/index.ts:543](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L543)

Error thrown when encrypted message is too large.

#### Remarks

The maximum payload size is 16KB (16384 bytes) for on-chain commitments.

#### Extends

- [`CommitmentsError`](#commitmentserror)

#### Constructors

##### Constructor

> **new PayloadTooLargeError**(`actualSize`, `maxSize`, `cause?`): [`PayloadTooLargeError`](#payloadtoolargeerror)

Defined in: [internal/errors/index.ts:554](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L554)

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

[`CommitmentsError`](#commitmentserror).[`constructor`](#constructor-19)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CommitmentsError`](#commitmentserror).[`cause`](#cause-16)

##### actualSize

> `readonly` **actualSize**: `number`

Defined in: [internal/errors/index.ts:545](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L545)

The actual size in bytes

##### maxSize

> `readonly` **maxSize**: `number`

Defined in: [internal/errors/index.ts:547](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L547)

The maximum allowed size in bytes (16384)

***

### FlowError

Defined in: [internal/errors/index.ts:574](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L574)

Error thrown when a flow operation fails.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`FlowAbortedError`](#flowabortederror)
- [`FlowTimeoutError`](#flowtimeouterror)

#### Constructors

##### Constructor

> **new FlowError**(`message`, `flowName`, `stepName?`, `cause?`): [`FlowError`](#flowerror)

Defined in: [internal/errors/index.ts:586](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L586)

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

[`CiferError`](#cifererror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

##### flowName

> `readonly` **flowName**: `string`

Defined in: [internal/errors/index.ts:576](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L576)

The flow that failed (e.g., 'createSecretAndWaitReady')

##### stepName?

> `readonly` `optional` **stepName**: `string`

Defined in: [internal/errors/index.ts:578](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L578)

The step that failed (if applicable)

***

### FlowAbortedError

Defined in: [internal/errors/index.ts:608](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L608)

Error thrown when a flow is aborted.

#### Remarks

Flows can be aborted by passing an `AbortSignal` to the flow context.
When the signal is aborted, this error is thrown.

#### Extends

- [`FlowError`](#flowerror)

#### Constructors

##### Constructor

> **new FlowAbortedError**(`flowName`, `stepName?`, `cause?`): [`FlowAbortedError`](#flowabortederror)

Defined in: [internal/errors/index.ts:614](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L614)

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

[`FlowError`](#flowerror).[`constructor`](#constructor-24)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`FlowError`](#flowerror).[`cause`](#cause-21)

##### flowName

> `readonly` **flowName**: `string`

Defined in: [internal/errors/index.ts:576](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L576)

The flow that failed (e.g., 'createSecretAndWaitReady')

###### Inherited from

[`FlowError`](#flowerror).[`flowName`](#flowname)

##### stepName?

> `readonly` `optional` **stepName**: `string`

Defined in: [internal/errors/index.ts:578](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L578)

The step that failed (if applicable)

###### Inherited from

[`FlowError`](#flowerror).[`stepName`](#stepname)

***

### FlowTimeoutError

Defined in: [internal/errors/index.ts:625](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L625)

Error thrown when a flow times out.

#### Extends

- [`FlowError`](#flowerror)

#### Constructors

##### Constructor

> **new FlowTimeoutError**(`flowName`, `timeoutMs`, `stepName?`, `cause?`): [`FlowTimeoutError`](#flowtimeouterror)

Defined in: [internal/errors/index.ts:635](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L635)

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

[`FlowError`](#flowerror).[`constructor`](#constructor-24)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`FlowError`](#flowerror).[`cause`](#cause-21)

##### flowName

> `readonly` **flowName**: `string`

Defined in: [internal/errors/index.ts:576](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L576)

The flow that failed (e.g., 'createSecretAndWaitReady')

###### Inherited from

[`FlowError`](#flowerror).[`flowName`](#flowname)

##### stepName?

> `readonly` `optional` **stepName**: `string`

Defined in: [internal/errors/index.ts:578](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L578)

The step that failed (if applicable)

###### Inherited from

[`FlowError`](#flowerror).[`stepName`](#stepname)

##### timeoutMs

> `readonly` **timeoutMs**: `number`

Defined in: [internal/errors/index.ts:627](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L627)

Timeout in milliseconds

***

### Web2Error

Defined in: [internal/errors/index.ts:661](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L661)

Base error class for Web2-specific errors.

#### Extends

- [`CiferError`](#cifererror)

#### Extended by

- [`Web2SessionError`](#web2sessionerror)
- [`Web2AuthError`](#web2autherror)

#### Constructors

##### Constructor

> **new Web2Error**(`message`, `cause?`): [`Web2Error`](#web2error)

Defined in: [internal/errors/index.ts:666](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L666)

###### Parameters

###### message

`string`

Description of the Web2 error

###### cause?

`Error`

Original error

###### Returns

[`Web2Error`](#web2error)

###### Overrides

[`CiferError`](#cifererror).[`constructor`](#constructor-3)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`CiferError`](#cifererror).[`cause`](#cause)

***

### Web2SessionError

Defined in: [internal/errors/index.ts:683](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L683)

Error thrown when a Web2 session is expired, missing, or cannot be renewed.

#### Remarks

This error is thrown when:
- A managed session has expired and renewal failed
- An existing-key session has expired (cannot be renewed without Ed25519)
- The server reports "no active session"

#### Extends

- [`Web2Error`](#web2error)

#### Constructors

##### Constructor

> **new Web2SessionError**(`message`, `cause?`): [`Web2SessionError`](#web2sessionerror)

Defined in: [internal/errors/index.ts:688](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L688)

###### Parameters

###### message

`string`

Description of the session error

###### cause?

`Error`

Original error

###### Returns

[`Web2SessionError`](#web2sessionerror)

###### Overrides

[`Web2Error`](#web2error).[`constructor`](#constructor-27)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

[`Web2Error`](#web2error).[`code`](#code-24)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`Web2Error`](#web2error).[`cause`](#cause-24)

***

### Web2AuthError

Defined in: [internal/errors/index.ts:706](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L706)

Error thrown when a Web2 authentication operation fails.

#### Remarks

This error is thrown for failures in:
- Registration (email/password validation)
- Email verification (invalid/expired OTP)
- Key registration (Ed25519 signature invalid, password wrong)
- Password reset flows

#### Extends

- [`Web2Error`](#web2error)

#### Constructors

##### Constructor

> **new Web2AuthError**(`message`, `cause?`): [`Web2AuthError`](#web2autherror)

Defined in: [internal/errors/index.ts:711](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L711)

###### Parameters

###### message

`string`

Description of the auth error

###### cause?

`Error`

Original error

###### Returns

[`Web2AuthError`](#web2autherror)

###### Overrides

[`Web2Error`](#web2error).[`constructor`](#constructor-27)

#### Properties

##### code

> `readonly` **code**: `string`

Defined in: [internal/errors/index.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L57)

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

[`Web2Error`](#web2error).[`code`](#code-24)

##### cause?

> `readonly` `optional` **cause**: `Error`

Defined in: [internal/errors/index.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L60)

Original error that caused this error (for error chaining)

###### Inherited from

[`Web2Error`](#web2error).[`cause`](#cause-24)

## Interfaces

### CiferSdk

Defined in: [index.ts:241](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L241)

CIFER SDK instance.

Provides access to all SDK functionality through organized namespaces
and helper methods for chain configuration.

#### Remarks

Create an instance using [createCiferSdk](#createcifersdk) (async with discovery)
or [createCiferSdkSync](#createcifersdksync) (sync without discovery).

#### Properties

##### keyManagement

> `readonly` **keyManagement**: [`keyManagement`](cifer-sdk-API-Reference/namespaces/keyManagement.md)

Defined in: [index.ts:249](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L249)

Key management operations (SecretsController).

###### Remarks

Provides functions for reading secret state, building transaction
intents, and parsing events.

##### blackbox

> `readonly` **blackbox**: [`blackbox`](cifer-sdk-API-Reference/namespaces/blackbox/index.md)

Defined in: [index.ts:257](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L257)

Blackbox API operations (encryption/decryption).

###### Remarks

Provides namespaces for payload, file, and job operations.

##### commitments

> `readonly` **commitments**: [`commitments`](cifer-sdk-API-Reference/namespaces/commitments.md)

Defined in: [index.ts:266](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L266)

On-chain commitment operations.

###### Remarks

Provides functions for reading, storing, and verifying encrypted
commitments on-chain.

##### flows

> `readonly` **flows**: [`flows`](cifer-sdk-API-Reference/namespaces/flows.md)

Defined in: [index.ts:275](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L275)

High-level orchestrated flows.

###### Remarks

Provides complete workflows for common operations like creating
secrets, encrypting data, and decrypting from logs.

##### blackboxUrl

> `readonly` **blackboxUrl**: `string`

Defined in: [index.ts:280](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L280)

The configured blackbox URL.

##### discovery

> `readonly` **discovery**: [`DiscoveryResult`](#discoveryresult) \| `null`

Defined in: [index.ts:285](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L285)

The discovery result (null if discovery was not performed).

##### signer?

> `readonly` `optional` **signer**: [`SignerAdapter`](#signeradapter)

Defined in: [index.ts:290](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L290)

The default signer (if configured).

##### readClient

> `readonly` **readClient**: [`ReadClient`](#readclient-1)

Defined in: [index.ts:295](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L295)

The default read client.

#### Methods

##### getControllerAddress()

> **getControllerAddress**(`chainId`): `` `0x${string}` ``

Defined in: [index.ts:304](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L304)

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

Defined in: [index.ts:313](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L313)

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

Defined in: [index.ts:320](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L320)

Get supported chain IDs.

###### Returns

`number`[]

Array of supported chain IDs

##### refreshDiscovery()

> **refreshDiscovery**(): `Promise`\<`void`\>

Defined in: [index.ts:331](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L331)

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

Defined in: [types/adapters.ts:57](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L57)

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

Defined in: [types/adapters.ts:65](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L65)

Get the address of the signer.

###### Returns

`Promise`\<`` `0x${string}` ``\>

A promise resolving to the checksummed Ethereum address

###### Throws

[AuthError](#autherror) When the wallet is not connected or no accounts are available

##### signMessage()

> **signMessage**(`message`): `Promise`\<`` `0x${string}` ``\>

Defined in: [types/adapters.ts:82](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L82)

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

Defined in: [types/adapters.ts:99](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L99)

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

Defined in: [types/adapters.ts:107](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L107)

Call request for making eth_call.

#### Properties

##### to

> **to**: `` `0x${string}` ``

Defined in: [types/adapters.ts:109](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L109)

Contract address to call

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/adapters.ts:111](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L111)

Encoded calldata

##### blockTag?

> `optional` **blockTag**: `number` \| `"pending"` \| `"latest"`

Defined in: [types/adapters.ts:113](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L113)

Block tag or number (default: 'latest')

***

### ReadClient

Defined in: [types/adapters.ts:142](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L142)

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

Defined in: [types/adapters.ts:151](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L151)

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

Defined in: [types/adapters.ts:162](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L162)

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

Defined in: [types/adapters.ts:178](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L178)

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

Defined in: [types/adapters.ts:192](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L192)

EIP-1193 provider interface (minimal subset).

#### Remarks

This is the standard interface for Ethereum providers as specified in EIP-1193.
Most wallets (MetaMask, WalletConnect, Coinbase Wallet, etc.) implement this.

#### See

[EIP-1193 Specification](https://eips.ethereum.org/EIPS/eip-1193)

#### Methods

##### request()

> **request**(`args`): `Promise`\<`unknown`\>

Defined in: [types/adapters.ts:199](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L199)

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

Defined in: [types/adapters.ts:210](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L210)

Configuration for the RpcReadClient.

#### Properties

##### rpcUrlByChainId

> **rpcUrlByChainId**: `Record`\<[`ChainId`](#chainid-1), `string`\>

Defined in: [types/adapters.ts:222](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L222)

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

Defined in: [types/adapters.ts:230](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/adapters.ts#L230)

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

Defined in: [types/common.ts:168](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L168)

Represents an EVM log entry from a transaction receipt.

#### Remarks

Logs are used to retrieve encrypted commitment data that is emitted
in events rather than stored directly in contract storage.

#### Properties

##### address

> **address**: `` `0x${string}` ``

Defined in: [types/common.ts:170](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L170)

Contract address that emitted the log

##### topics

> **topics**: `` `0x${string}` ``[]

Defined in: [types/common.ts:172](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L172)

Array of indexed topics (topic[0] is the event signature)

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/common.ts:174](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L174)

Non-indexed data (ABI-encoded)

##### blockNumber

> **blockNumber**: `number`

Defined in: [types/common.ts:176](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L176)

Block number where log was emitted

##### transactionHash

> **transactionHash**: `` `0x${string}` ``

Defined in: [types/common.ts:178](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L178)

Transaction hash

##### logIndex

> **logIndex**: `number`

Defined in: [types/common.ts:180](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L180)

Log index within the block

##### transactionIndex

> **transactionIndex**: `number`

Defined in: [types/common.ts:182](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L182)

Transaction index within the block

***

### LogFilter

Defined in: [types/common.ts:193](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L193)

Filter for querying logs via eth_getLogs.

#### Remarks

Used with [ReadClient.getLogs](#getlogs-2) to retrieve event logs from the blockchain.

#### Properties

##### address?

> `optional` **address**: `` `0x${string}` ``

Defined in: [types/common.ts:195](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L195)

Contract address to filter by

##### topics?

> `optional` **topics**: (`` `0x${string}` `` \| `null`)[]

Defined in: [types/common.ts:197](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L197)

Topics to filter by (null for wildcard at that position)

##### fromBlock?

> `optional` **fromBlock**: `number` \| `"latest"`

Defined in: [types/common.ts:199](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L199)

Start block (inclusive)

##### toBlock?

> `optional` **toBlock**: `number` \| `"latest"`

Defined in: [types/common.ts:201](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L201)

End block (inclusive)

***

### TransactionReceipt

Defined in: [types/common.ts:209](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L209)

Transaction receipt returned after a transaction is mined.

#### Properties

##### transactionHash

> **transactionHash**: `` `0x${string}` ``

Defined in: [types/common.ts:211](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L211)

Transaction hash

##### blockNumber

> **blockNumber**: `number`

Defined in: [types/common.ts:213](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L213)

Block number where transaction was included

##### contractAddress?

> `optional` **contractAddress**: `` `0x${string}` ``

Defined in: [types/common.ts:215](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L215)

Contract address if this was a contract creation

##### status

> **status**: `0` \| `1`

Defined in: [types/common.ts:217](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L217)

Status (1 = success, 0 = failure/revert)

##### gasUsed

> **gasUsed**: `bigint`

Defined in: [types/common.ts:219](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L219)

Gas used by this transaction

##### logs

> **logs**: [`Log`](#log)[]

Defined in: [types/common.ts:221](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L221)

Logs emitted by this transaction

***

### SecretState

Defined in: [types/common.ts:238](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L238)

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

Defined in: [types/common.ts:240](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L240)

Owner address of the secret (can transfer, set delegate, decrypt)

##### delegate

> **delegate**: `` `0x${string}` ``

Defined in: [types/common.ts:242](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L242)

Delegate address (can decrypt on owner's behalf, zero address if none)

##### isSyncing

> **isSyncing**: `boolean`

Defined in: [types/common.ts:244](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L244)

Whether the secret is still syncing (not ready for use)

##### clusterId

> **clusterId**: `number`

Defined in: [types/common.ts:246](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L246)

Cluster ID where the secret's private key shards are stored

##### secretType

> **secretType**: `number`

Defined in: [types/common.ts:248](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L248)

Secret type (1 = standard ML-KEM-768 encryption)

##### publicKeyCid

> **publicKeyCid**: `string`

Defined in: [types/common.ts:253](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L253)

On-chain readiness marker. New secrets use [ON\_CHAIN\_PUBLIC\_KEY\_PLACEHOLDER](#on_chain_public_key_placeholder).
Fetch the actual ML-KEM public key via `blackbox.publicKey.getSecretPublicKey()`.

***

### CIFERMetadata

Defined in: [types/common.ts:266](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L266)

CIFER metadata stored on-chain for encrypted commitments.

#### Remarks

This metadata is stored in contract storage and used to:
- Locate the block where encrypted data was emitted
- Verify integrity of retrieved data via hash comparison

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [types/common.ts:268](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L268)

Secret ID used for encryption

##### storedAtBlock

> **storedAtBlock**: `number`

Defined in: [types/common.ts:270](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L270)

Block number when data was stored/updated

##### ciferHash

> **ciferHash**: `` `0x${string}` ``

Defined in: [types/common.ts:272](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L272)

keccak256 hash of the cifer bytes

##### encryptedMessageHash

> **encryptedMessageHash**: `` `0x${string}` ``

Defined in: [types/common.ts:274](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L274)

keccak256 hash of the encrypted message bytes

***

### CommitmentData

Defined in: [types/common.ts:286](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L286)

Encrypted commitment data retrieved from event logs.

#### Remarks

This data is emitted in `CIFERDataStored` or `CIFERDataUpdated` events
and must be retrieved from logs to decrypt the content.

#### Properties

##### cifer

> **cifer**: `` `0x${string}` ``

Defined in: [types/common.ts:288](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L288)

The CIFER envelope bytes (exactly 1104 bytes: ML-KEM ciphertext + AES-GCM tag)

##### encryptedMessage

> **encryptedMessage**: `` `0x${string}` ``

Defined in: [types/common.ts:290](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L290)

The AES-GCM encrypted message bytes (variable length, max 16KB)

##### ciferHash

> **ciferHash**: `` `0x${string}` ``

Defined in: [types/common.ts:292](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L292)

keccak256(cifer) - for integrity verification

##### encryptedMessageHash

> **encryptedMessageHash**: `` `0x${string}` ``

Defined in: [types/common.ts:294](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L294)

keccak256(encryptedMessage) - for integrity verification

***

### JobInfo

Defined in: [types/common.ts:306](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L306)

Job information returned by the blackbox.

#### Remarks

File encryption and decryption operations are asynchronous. This interface
represents the state of a job at any point in its lifecycle.

#### Properties

##### id

> **id**: `string`

Defined in: [types/common.ts:308](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L308)

Unique job identifier (UUID)

##### type

> **type**: [`JobType`](#jobtype)

Defined in: [types/common.ts:310](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L310)

Type of job (encrypt or decrypt)

##### status

> **status**: [`JobStatus`](#jobstatus)

Defined in: [types/common.ts:312](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L312)

Current status

##### progress

> **progress**: `number`

Defined in: [types/common.ts:314](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L314)

Progress percentage (0-100)

##### secretId

> **secretId**: `number`

Defined in: [types/common.ts:316](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L316)

Secret ID used for this job

##### chainId

> **chainId**: `number`

Defined in: [types/common.ts:318](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L318)

Chain ID

##### createdAt

> **createdAt**: `number`

Defined in: [types/common.ts:320](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L320)

Unix timestamp (ms) when job was created

##### completedAt?

> `optional` **completedAt**: `number`

Defined in: [types/common.ts:322](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L322)

Unix timestamp (ms) when job completed (if completed)

##### expiredAt?

> `optional` **expiredAt**: `number`

Defined in: [types/common.ts:324](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L324)

Unix timestamp (ms) when job will expire

##### error?

> `optional` **error**: `string`

Defined in: [types/common.ts:326](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L326)

Error message if job failed

##### resultFileName?

> `optional` **resultFileName**: `string`

Defined in: [types/common.ts:328](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L328)

Result filename for download

##### ttl

> **ttl**: `number`

Defined in: [types/common.ts:330](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L330)

Time-to-live in milliseconds

##### originalSize?

> `optional` **originalSize**: `number`

Defined in: [types/common.ts:332](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L332)

Original file size in bytes

##### signerPrincipalId?

> `optional` **signerPrincipalId**: `string` \| `null`

Defined in: [types/common.ts:334](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L334)

Web2 principalId of job initiator. null for Web3 jobs.

##### secretOwnerPrincipalId?

> `optional` **secretOwnerPrincipalId**: `string` \| `null`

Defined in: [types/common.ts:336](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L336)

Web2 principalId of secret owner. null for Web3 jobs.

***

### UsageStats

Defined in: [types/common.ts:344](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L344)

Usage statistics for a single direction (encryption or decryption).

#### Properties

##### limit

> **limit**: `number`

Defined in: [types/common.ts:346](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L346)

Data limit in bytes

##### used

> **used**: `number`

Defined in: [types/common.ts:348](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L348)

Data used in bytes

##### remaining

> **remaining**: `number`

Defined in: [types/common.ts:350](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L350)

Data remaining in bytes

##### count

> **count**: `number`

Defined in: [types/common.ts:352](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L352)

Number of operations performed

##### requestLimit

> **requestLimit**: `number`

Defined in: [types/common.ts:354](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L354)

Request limit per billing cycle

##### rateLimit

> **rateLimit**: `number`

Defined in: [types/common.ts:356](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L356)

Rate limit (requests per second)

##### limitGB

> **limitGB**: `number`

Defined in: [types/common.ts:358](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L358)

Limit in GB

##### usedGB

> **usedGB**: `number`

Defined in: [types/common.ts:360](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L360)

Used in GB

##### remainingGB

> **remainingGB**: `number`

Defined in: [types/common.ts:362](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L362)

Remaining in GB

***

### DataConsumption

Defined in: [types/common.ts:375](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L375)

Data consumption/usage statistics for a user.

#### Remarks

The blackbox tracks encryption and decryption usage per user
for rate limiting and billing purposes. The `userId` identifies
the user (wallet address for Web3, principalId for Web2).

#### Properties

##### userId

> **userId**: `string`

Defined in: [types/common.ts:377](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L377)

User identifier (wallet address for web3, principalId for web2)

##### userType

> **userType**: `string`

Defined in: [types/common.ts:379](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L379)

User type ('web3' or 'web2')

##### planId

> **planId**: `string`

Defined in: [types/common.ts:381](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L381)

Plan identifier (e.g. 'free')

##### cycleType

> **cycleType**: `string`

Defined in: [types/common.ts:383](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L383)

Billing cycle type (e.g. 'monthly')

##### periodStart

> **periodStart**: `string`

Defined in: [types/common.ts:385](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L385)

Billing period start (ISO 8601)

##### periodEnd

> **periodEnd**: `string`

Defined in: [types/common.ts:387](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L387)

Billing period end (ISO 8601)

##### encryption

> **encryption**: [`UsageStats`](#usagestats)

Defined in: [types/common.ts:389](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L389)

Encryption usage statistics

##### decryption

> **decryption**: [`UsageStats`](#usagestats)

Defined in: [types/common.ts:391](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L391)

Decryption usage statistics

***

### ChainConfig

Defined in: [types/config.ts:26](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L26)

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

Defined in: [types/config.ts:28](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L28)

Chain ID

##### name?

> `optional` **name**: `string`

Defined in: [types/config.ts:30](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L30)

Human-readable chain name (e.g., 'Ternoa Mainnet')

##### rpcUrl

> **rpcUrl**: `string`

Defined in: [types/config.ts:32](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L32)

HTTP RPC URL for this chain

##### wsRpcUrl?

> `optional` **wsRpcUrl**: `string`

Defined in: [types/config.ts:34](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L34)

WebSocket RPC URL for this chain (optional, for subscriptions)

##### secretsControllerAddress

> **secretsControllerAddress**: `` `0x${string}` ``

Defined in: [types/config.ts:36](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L36)

SecretsController contract address on this chain

##### blockTimeMs?

> `optional` **blockTimeMs**: `number`

Defined in: [types/config.ts:38](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L38)

Block time in milliseconds (used for timeout calculations)

***

### DiscoveryResult

Defined in: [types/config.ts:54](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L54)

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

Defined in: [types/config.ts:56](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L56)

Status of the blackbox service ('ok' when healthy)

##### enclaveWalletAddress

> **enclaveWalletAddress**: `` `0x${string}` ``

Defined in: [types/config.ts:58](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L58)

Enclave wallet address used by the blackbox for on-chain verification

##### supportedChains

> **supportedChains**: `number`[]

Defined in: [types/config.ts:60](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L60)

List of supported chain IDs

##### chains

> **chains**: [`ChainConfig`](#chainconfig)[]

Defined in: [types/config.ts:62](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L62)

Per-chain configuration

##### ~~ipfsGatewayUrl?~~

> `optional` **ipfsGatewayUrl**: `string`

Defined in: [types/config.ts:66](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L66)

###### Deprecated

Blackbox no longer exposes IPFS. Use `blackbox.publicKey.getSecretPublicKey()`.

##### fetchedAt

> **fetchedAt**: `number`

Defined in: [types/config.ts:68](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L68)

Unix timestamp (ms) when this discovery result was fetched

##### serverTime?

> `optional` **serverTime**: `number`

Defined in: [types/config.ts:81](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L81)

Blackbox server's own clock at the moment it handled the `/healthz` request,
as a Unix timestamp (ms).

###### Remarks

Useful for client-side device clock integrity checks: compare `Date.now()`
against `serverTime` to detect a misconfigured or manipulated device clock,
independent of network latency (both are captured close together — `fetchedAt`
is set immediately after the response is parsed).

Optional for backward compatibility with Blackbox deployments predating this field.

***

### CiferSdkConfig

Defined in: [types/config.ts:120](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L120)

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
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
```

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
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

Defined in: [types/config.ts:131](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L131)

Blackbox URL (e.g., 'https://blackbox.cifersecurity.com:3010').

###### Remarks

If provided, the SDK will perform discovery by calling the `/healthz`
endpoint to fetch chain configurations automatically.

If not provided, the SDK will require explicit chain configs
via `chainOverrides` for all operations.

##### signer?

> `optional` **signer**: [`SignerAdapter`](#signeradapter)

Defined in: [types/config.ts:140](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L140)

Default signer adapter to use for signing operations.

###### Remarks

Can be overridden per-call. If not provided, each operation
that requires signing must receive a signer explicitly.

##### readClient?

> `optional` **readClient**: [`ReadClient`](#readclient-1)

Defined in: [types/config.ts:149](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L149)

Default read client for RPC operations.

###### Remarks

Can be overridden per-call. If not provided, the SDK will
create a read client using RPC URLs from discovery.

##### chainOverrides?

> `optional` **chainOverrides**: `Record`\<`number`, `Partial`\<[`ChainConfig`](#chainconfig)\>\>

Defined in: [types/config.ts:173](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L173)

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

Defined in: [types/config.ts:183](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L183)

Discovery cache TTL in milliseconds.

###### Remarks

Discovery results are cached in memory to avoid repeated network calls.

###### Default Value

```ts
300000 (5 minutes)
```

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/config.ts:191](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L191)

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

Defined in: [types/config.ts:206](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L206)

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

Defined in: [types/config.ts:217](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L217)

Resolved configuration for a specific chain.

#### Remarks

This extends [ChainConfig](#chainconfig) with metadata about the configuration source.

#### Extends

- [`ChainConfig`](#chainconfig)

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [types/config.ts:28](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L28)

Chain ID

###### Inherited from

[`ChainConfig`](#chainconfig).[`chainId`](#chainid-3)

##### name?

> `optional` **name**: `string`

Defined in: [types/config.ts:30](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L30)

Human-readable chain name (e.g., 'Ternoa Mainnet')

###### Inherited from

[`ChainConfig`](#chainconfig).[`name`](#name)

##### rpcUrl

> **rpcUrl**: `string`

Defined in: [types/config.ts:32](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L32)

HTTP RPC URL for this chain

###### Inherited from

[`ChainConfig`](#chainconfig).[`rpcUrl`](#rpcurl)

##### wsRpcUrl?

> `optional` **wsRpcUrl**: `string`

Defined in: [types/config.ts:34](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L34)

WebSocket RPC URL for this chain (optional, for subscriptions)

###### Inherited from

[`ChainConfig`](#chainconfig).[`wsRpcUrl`](#wsrpcurl)

##### secretsControllerAddress

> **secretsControllerAddress**: `` `0x${string}` ``

Defined in: [types/config.ts:36](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L36)

SecretsController contract address on this chain

###### Inherited from

[`ChainConfig`](#chainconfig).[`secretsControllerAddress`](#secretscontrolleraddress)

##### blockTimeMs?

> `optional` **blockTimeMs**: `number`

Defined in: [types/config.ts:38](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L38)

Block time in milliseconds (used for timeout calculations)

###### Inherited from

[`ChainConfig`](#chainconfig).[`blockTimeMs`](#blocktimems)

##### fromDiscovery

> **fromDiscovery**: `boolean`

Defined in: [types/config.ts:219](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L219)

Whether this config came from discovery (true) or overrides only (false)

***

### SdkContext

Defined in: [types/config.ts:231](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L231)

**`Internal`**

Internal SDK context passed to domain modules.

#### Remarks

This is an internal type used to pass configuration and dependencies
between SDK modules. It should not be used directly by SDK consumers.

#### Properties

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/config.ts:233](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L233)

Blackbox base URL

##### discovery

> **discovery**: [`DiscoveryResult`](#discoveryresult) \| `null`

Defined in: [types/config.ts:235](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L235)

Discovery result (may be null if not yet fetched)

##### chainOverrides

> **chainOverrides**: `Record`\<[`ChainId`](#chainid-1), `Partial`\<[`ChainConfig`](#chainconfig)\>\>

Defined in: [types/config.ts:237](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L237)

Chain configuration overrides

##### signer?

> `optional` **signer**: [`SignerAdapter`](#signeradapter)

Defined in: [types/config.ts:239](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L239)

Default signer

##### readClient?

> `optional` **readClient**: [`ReadClient`](#readclient-1)

Defined in: [types/config.ts:241](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L241)

Default read client

##### fetch()

> **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/config.ts:243](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L243)

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

Defined in: [types/config.ts:245](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/config.ts#L245)

Logger

###### Parameters

###### message

`string`

###### Returns

`void`

***

### TxIntent

Defined in: [types/tx-intent.ts:67](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L67)

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

Defined in: [types/tx-intent.ts:75](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L75)

The chain ID where this transaction should be executed.

###### Remarks

Apps should verify the wallet is connected to the correct chain
before submitting the transaction.

##### to

> **to**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:80](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L80)

The recipient address (contract address for contract calls).

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:85](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L85)

The calldata for the transaction (ABI-encoded function call).

##### value?

> `optional` **value**: `bigint`

Defined in: [types/tx-intent.ts:94](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L94)

The value to send with the transaction (in wei).

###### Remarks

Only set for payable functions. For non-payable functions,
this will be `undefined`.

***

### TxIntentWithMeta

Defined in: [types/tx-intent.ts:106](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L106)

Extended transaction intent with additional metadata useful for UX and debugging.

#### Remarks

Transaction builders in the SDK return this extended type which includes
human-readable descriptions and decoded arguments for display purposes.

#### Extends

- [`TxIntent`](#txintent)

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [types/tx-intent.ts:75](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L75)

The chain ID where this transaction should be executed.

###### Remarks

Apps should verify the wallet is connected to the correct chain
before submitting the transaction.

###### Inherited from

[`TxIntent`](#txintent).[`chainId`](#chainid-5)

##### to

> **to**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:80](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L80)

The recipient address (contract address for contract calls).

###### Inherited from

[`TxIntent`](#txintent).[`to`](#to-1)

##### data

> **data**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:85](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L85)

The calldata for the transaction (ABI-encoded function call).

###### Inherited from

[`TxIntent`](#txintent).[`data`](#data-2)

##### value?

> `optional` **value**: `bigint`

Defined in: [types/tx-intent.ts:94](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L94)

The value to send with the transaction (in wei).

###### Remarks

Only set for payable functions. For non-payable functions,
this will be `undefined`.

###### Inherited from

[`TxIntent`](#txintent).[`value`](#value)

##### description

> **description**: `string`

Defined in: [types/tx-intent.ts:112](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L112)

Human-readable description of what this transaction does.

###### Example

```ts
`'Create a new CIFER secret'`
```

##### functionName

> **functionName**: `string`

Defined in: [types/tx-intent.ts:119](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L119)

The function being called (for display purposes).

###### Example

```ts
`'createSecret'`
```

##### args?

> `optional` **args**: `Record`\<`string`, `unknown`\>

Defined in: [types/tx-intent.ts:128](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L128)

The decoded arguments (for display purposes).

###### Remarks

Arguments are provided as a record for easy display in UIs.
BigInt values are converted to strings for JSON serialization.

***

### TxExecutionResult

Defined in: [types/tx-intent.ts:136](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L136)

Result of executing a transaction intent.

#### Properties

##### hash

> **hash**: `` `0x${string}` ``

Defined in: [types/tx-intent.ts:140](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L140)

The transaction hash.

##### waitReceipt()

> **waitReceipt**: () => `Promise`\<[`TransactionReceipt`](#transactionreceipt)\>

Defined in: [types/tx-intent.ts:147](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L147)

Function to wait for the transaction receipt.

###### Returns

`Promise`\<[`TransactionReceipt`](#transactionreceipt)\>

A promise resolving to the transaction receipt

***

### Ed25519Signer

Defined in: [types/web2.ts:44](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L44)

Ed25519 signer callback interface.

#### Remarks

The SDK does not bundle a specific Ed25519 library. Consumers can
implement this interface using any library they prefer, for example:
- `@noble/ed25519`
- Node.js `crypto.sign('ed25519', ...)`
- A TEE-backed signing service

#### Example

```typescript
import * as ed25519 from '@noble/ed25519';

const ed25519Signer: Ed25519Signer = {
  async sign(message: Uint8Array) {
    return ed25519.sign(message, privateKey);
  },
  getPublicKey() {
    return ed25519.getPublicKey(privateKey);
  },
};
```

#### Methods

##### sign()

> **sign**(`message`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [types/web2.ts:51](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L51)

Sign a message with the Ed25519 private key.

###### Parameters

###### message

`Uint8Array`

Raw bytes to sign

###### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

The 64-byte Ed25519 signature

##### getPublicKey()

> **getPublicKey**(): `Uint8Array`

Defined in: [types/web2.ts:58](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L58)

Get the Ed25519 public key (32 bytes).

###### Returns

`Uint8Array`

The 32-byte public key

***

### RegisterParams

Defined in: [types/web2.ts:70](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L70)

Parameters for email+password registration.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:72](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L72)

Email address (must contain @)

##### password

> **password**: `string`

Defined in: [types/web2.ts:74](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L74)

Password (minimum 8 characters)

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:76](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L76)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:78](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L78)

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

### RegisterResult

Defined in: [types/web2.ts:86](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L86)

Result of registration.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:88](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L88)

The assigned principal UUID

##### message

> **message**: `string`

Defined in: [types/web2.ts:90](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L90)

Server message (e.g. "OTP sent to email")

***

### VerifyEmailParams

Defined in: [types/web2.ts:98](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L98)

Parameters for email OTP verification.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:100](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L100)

Email address

##### otp

> **otp**: `string`

Defined in: [types/web2.ts:102](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L102)

OTP code received via email

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:104](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L104)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:106](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L106)

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

### VerifyEmailResult

Defined in: [types/web2.ts:114](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L114)

Result of email verification.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:116](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L116)

The principal UUID

##### emailVerified

> **emailVerified**: `boolean`

Defined in: [types/web2.ts:118](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L118)

Whether the email is now verified

***

### RegisterKeyParams

Defined in: [types/web2.ts:126](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L126)

Parameters for Ed25519 key registration (Phase 2).

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:128](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L128)

Principal UUID from registration

##### password

> **password**: `string`

Defined in: [types/web2.ts:130](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L130)

Password for verification

##### ed25519Signer

> **ed25519Signer**: [`Ed25519Signer`](#ed25519signer)

Defined in: [types/web2.ts:132](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L132)

Ed25519 signer (provides publicKey + sign)

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:134](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L134)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:136](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L136)

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

### RegisterKeyResult

Defined in: [types/web2.ts:144](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L144)

Result of key registration.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:146](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L146)

The principal UUID

##### emailHex

> **emailHex**: `string`

Defined in: [types/web2.ts:148](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L148)

Hex-encoded email

##### nodeRegistrationStatus

> **nodeRegistrationStatus**: `"pending"` \| `"failed"` \| `"complete"` \| `"partial"`

Defined in: [types/web2.ts:156](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L156)

Status of node registration.
- `"complete"`: all 5 nodes registered
- `"partial"`: quorum threshold reached (3+ of 5), can create sessions
- `"pending"`: some nodes registered but below threshold, need retry
- `"failed"`: all nodes failed

##### failedNodes

> **failedNodes**: `string`[]

Defined in: [types/web2.ts:158](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L158)

Array of node URLs that failed to register

##### nodeErrors

> **nodeErrors**: `string`[]

Defined in: [types/web2.ts:160](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L160)

Array of error details from failed nodes

***

### ResendOtpParams

Defined in: [types/web2.ts:168](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L168)

Parameters for resending the email OTP.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:170](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L170)

Email address

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:172](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L172)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:174](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L174)

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

### ForgotPasswordParams

Defined in: [types/web2.ts:182](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L182)

Parameters for sending a password-reset OTP.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:184](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L184)

Email address

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:186](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L186)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:188](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L188)

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

### ResetPasswordParams

Defined in: [types/web2.ts:196](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L196)

Parameters for resetting a password with OTP.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:198](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L198)

Email address

##### otp

> **otp**: `string`

Defined in: [types/web2.ts:200](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L200)

OTP received via email

##### newPassword

> **newPassword**: `string`

Defined in: [types/web2.ts:202](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L202)

New password (minimum 8 characters)

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:204](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L204)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:206](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L206)

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

### VerifyCredentialsParams

Defined in: [types/web2.ts:217](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L217)

Parameters for verifying Web2 email + password credentials.

#### Remarks

**Web2 only** (`chainId = -1`). Not available for Web3 wallet authentication.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:219](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L219)

Email address

##### password

> **password**: `string`

Defined in: [types/web2.ts:221](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L221)

Password

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:223](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L223)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:225](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L225)

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

### VerifyCredentialsResult

Defined in: [types/web2.ts:237](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L237)

Result of verifying Web2 credentials.

#### Remarks

**Web2 only**. Does not include a session token — use
createManagedSession after credentials are confirmed.

#### Properties

##### valid

> **valid**: `true`

Defined in: [types/web2.ts:239](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L239)

Always `true` on success (errors throw [Web2AuthError](#web2autherror))

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:241](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L241)

The principal UUID

***

### RequestAccountDeletionParams

Defined in: [types/web2.ts:249](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L249)

Parameters for requesting Web2 account deletion.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:251](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L251)

Account email address.

##### password

> **password**: `string`

Defined in: [types/web2.ts:253](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L253)

Account password (bcrypt-verified server-side).

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:255](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L255)

The principalId returned at registration (must match server-side).

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:257](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L257)

Blackbox base URL.

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:259](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L259)

Optional fetch override (for testing / non-global fetch).

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

***

### ConfirmAccountDeletionParams

Defined in: [types/web2.ts:267](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L267)

Parameters for confirming Web2 account deletion.

#### Properties

##### email

> **email**: `string`

Defined in: [types/web2.ts:269](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L269)

Account email address.

##### otp

> **otp**: `string`

Defined in: [types/web2.ts:271](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L271)

The 6-digit deletion-confirmation OTP emailed to the user.

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:273](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L273)

Blackbox base URL.

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:275](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L275)

Optional fetch override.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

***

### ConfirmAccountDeletionResult

Defined in: [types/web2.ts:283](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L283)

Result of confirming Web2 account deletion.

#### Properties

##### success

> **success**: `true`

Defined in: [types/web2.ts:285](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L285)

Always true on a 2xx response.

##### message

> **message**: `string`

Defined in: [types/web2.ts:287](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L287)

Human-readable confirmation message.

***

### RetryNodeRegistrationParams

Defined in: [types/web2.ts:295](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L295)

Parameters for retrying node registration.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:297](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L297)

Principal UUID

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:299](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L299)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:301](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L301)

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

### RetryNodeRegistrationResult

Defined in: [types/web2.ts:309](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L309)

Result of retrying node registration.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:311](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L311)

The principal UUID

##### nodeRegistrationStatus

> **nodeRegistrationStatus**: `"pending"` \| `"failed"` \| `"complete"` \| `"partial"`

Defined in: [types/web2.ts:313](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L313)

Updated node registration status

##### failedNodes

> **failedNodes**: `string`[]

Defined in: [types/web2.ts:315](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L315)

Array of node URLs that failed

##### message?

> `optional` **message**: `string`

Defined in: [types/web2.ts:317](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L317)

Optional server message

***

### NodeRegistrationStatusResult

Defined in: [types/web2.ts:325](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L325)

Result of checking node registration status.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:327](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L327)

The principal UUID

##### nodeRegistrationStatus

> **nodeRegistrationStatus**: `"pending"` \| `"failed"` \| `"complete"` \| `"partial"`

Defined in: [types/web2.ts:329](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L329)

Node registration status

##### successNodes

> **successNodes**: `string`[]

Defined in: [types/web2.ts:331](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L331)

Array of successful node URLs

##### failedNodes

> **failedNodes**: `string`[]

Defined in: [types/web2.ts:333](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L333)

Array of failed node URLs

***

### CreateManagedSessionParams

Defined in: [types/web2.ts:350](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L350)

Parameters for creating a managed session.

#### Remarks

A managed session uses an Ed25519 signer to create and renew sessions
automatically. The SDK generates an ephemeral EOA keypair and handles
session lifecycle.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:352](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L352)

Principal UUID

##### ed25519Signer

> **ed25519Signer**: [`Ed25519Signer`](#ed25519signer)

Defined in: [types/web2.ts:354](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L354)

Ed25519 signer for session creation/renewal

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:356](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L356)

Blackbox URL

##### ttl?

> `optional` **ttl**: `number`

Defined in: [types/web2.ts:362](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L362)

Session time-to-live in milliseconds.
Min: 60000 (1 minute), Max: 2592000000 (30 days).
Default: 900000 (15 minutes).

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:364](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L364)

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

### CreateSessionResult

Defined in: [types/web2.ts:372](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L372)

Raw result from the POST /web2/session endpoint.

#### Properties

##### sessionToken

> **sessionToken**: `string`

Defined in: [types/web2.ts:374](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L374)

Session token (used server-side, SDK does not need to store this for requests)

##### sessionAddress

> **sessionAddress**: `` `0x${string}` ``

Defined in: [types/web2.ts:376](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L376)

The session EOA address

##### quorumProof

> **quorumProof**: `object`[]

Defined in: [types/web2.ts:378](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L378)

Quorum proof from cluster nodes

###### nodeAddress

> **nodeAddress**: `string`

###### signature

> **signature**: `string`

##### expiresAt

> **expiresAt**: `string`

Defined in: [types/web2.ts:380](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L380)

ISO 8601 expiry timestamp

***

### UseExistingSessionKeyParams

Defined in: [types/web2.ts:395](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L395)

Parameters for using an existing session key.

#### Remarks

This is the "advanced" mode where the session has already been created
externally (e.g. via a TEE web front) and the SDK only receives the
session EOA private key.

The SDK will NOT be able to create or renew sessions in this mode.

#### Properties

##### sessionPrivateKey

> **sessionPrivateKey**: `string`

Defined in: [types/web2.ts:397](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L397)

The session EOA private key (hex string, with or without 0x prefix)

##### principalId?

> `optional` **principalId**: `string`

Defined in: [types/web2.ts:399](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L399)

Principal UUID (optional, for informational purposes)

***

### Web2Session

Defined in: [types/web2.ts:415](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L415)

Web2 session object returned by session creation functions.

#### Remarks

This object contains everything needed to make authenticated
Web2 requests: a `signer` (session EOA), `principalId`, and
session validity information.

For managed sessions, `renew()` and `ensureValid()` handle
automatic session lifecycle.

#### Properties

##### principalId

> `readonly` **principalId**: `string`

Defined in: [types/web2.ts:417](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L417)

The principal UUID

##### sessionAddress

> `readonly` **sessionAddress**: `` `0x${string}` ``

Defined in: [types/web2.ts:420](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L420)

The session EOA address

##### expiresAt

> `readonly` **expiresAt**: `string`

Defined in: [types/web2.ts:423](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L423)

ISO 8601 expiry timestamp (empty string for existing-key sessions)

##### signer

> `readonly` **signer**: [`SignerAdapter`](#signeradapter)

Defined in: [types/web2.ts:426](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L426)

The signer adapter wrapping the session EOA private key

##### isManaged

> `readonly` **isManaged**: `boolean`

Defined in: [types/web2.ts:429](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L429)

Whether this is a managed session (can renew)

#### Methods

##### renew()

> **renew**(): `Promise`\<`void`\>

Defined in: [types/web2.ts:438](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L438)

Renew the session.

###### Returns

`Promise`\<`void`\>

###### Remarks

Only available for managed sessions. Throws `Web2SessionError`
for existing-key sessions.

##### ensureValid()

> **ensureValid**(): `Promise`\<`void`\>

Defined in: [types/web2.ts:450](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L450)

Ensure the session is still valid, renewing if near expiry.

###### Returns

`Promise`\<`void`\>

###### Remarks

For managed sessions, renews automatically if the session expires
within the next 60 seconds.

For existing-key sessions, this is a no-op (cannot check validity
without a server call).

***

### CreateWeb2SecretParams

Defined in: [types/web2.ts:462](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L462)

Parameters for creating a Web2 secret.

#### Properties

##### session

> **session**: [`Web2Session`](#web2session)

Defined in: [types/web2.ts:464](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L464)

Active Web2 session

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:466](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L466)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:468](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L468)

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

### CreateWeb2SecretResult

Defined in: [types/web2.ts:476](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L476)

Result of creating a Web2 secret.

#### Properties

##### success

> **success**: `boolean`

Defined in: [types/web2.ts:478](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L478)

Whether the operation succeeded

##### secretId

> **secretId**: `number`

Defined in: [types/web2.ts:480](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L480)

The assigned secret ID

##### clusterId

> **clusterId**: `number`

Defined in: [types/web2.ts:482](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L482)

Cluster ID where the secret is stored

##### publicKeyCid

> **publicKeyCid**: `string`

Defined in: [types/web2.ts:484](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L484)

IPFS CID of the public key

##### status

> **status**: `"complete"` \| `"propagating"`

Defined in: [types/web2.ts:490](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L490)

Status of secret creation.
- `"complete"`: secret fully created and synced
- `"propagating"`: secret created but still propagating to some nodes

***

### ListWeb2SecretsParams

Defined in: [types/web2.ts:498](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L498)

Parameters for listing Web2 secrets.

#### Properties

##### session

> **session**: [`Web2Session`](#web2session)

Defined in: [types/web2.ts:500](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L500)

Active Web2 session

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:502](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L502)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:504](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L504)

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

### Web2SecretInfo

Defined in: [types/web2.ts:512](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L512)

Web2 secret information.

#### Properties

##### secretId

> **secretId**: `number`

Defined in: [types/web2.ts:514](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L514)

Secret ID

##### ownerPrincipalId

> **ownerPrincipalId**: `string`

Defined in: [types/web2.ts:516](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L516)

Owner principal UUID

##### delegatePrincipalId

> **delegatePrincipalId**: `string` \| `null`

Defined in: [types/web2.ts:518](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L518)

Delegate principal UUID (null if none)

##### isSyncing

> **isSyncing**: `number`

Defined in: [types/web2.ts:520](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L520)

Whether the secret is still syncing

##### clusterId

> **clusterId**: `number`

Defined in: [types/web2.ts:522](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L522)

Cluster ID

##### secretType

> **secretType**: `number`

Defined in: [types/web2.ts:524](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L524)

Secret type (1 = standard ML-KEM-768 encryption)

##### publicKeyCid

> **publicKeyCid**: `string`

Defined in: [types/web2.ts:526](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L526)

IPFS CID of the public key

##### createdAt

> **createdAt**: `string`

Defined in: [types/web2.ts:528](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L528)

ISO 8601 creation timestamp

##### updatedAt

> **updatedAt**: `string`

Defined in: [types/web2.ts:530](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L530)

ISO 8601 last update timestamp

***

### ListWeb2SecretsResult

Defined in: [types/web2.ts:538](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L538)

Result of listing Web2 secrets.

#### Properties

##### success

> **success**: `boolean`

Defined in: [types/web2.ts:540](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L540)

Whether the operation succeeded

##### secrets

> **secrets**: [`Web2SecretInfo`](#web2secretinfo)[]

Defined in: [types/web2.ts:542](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L542)

Array of secret info

***

### SetWeb2DelegateParams

Defined in: [types/web2.ts:554](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L554)

Parameters for setting a Web2 delegate.

#### Properties

##### session

> **session**: [`Web2Session`](#web2session)

Defined in: [types/web2.ts:556](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L556)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [types/web2.ts:558](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L558)

Secret ID to set delegate for

##### delegatePrincipalId

> **delegatePrincipalId**: `string`

Defined in: [types/web2.ts:562](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L562)

The delegate principal UUID, or empty string to remove the delegate.

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:564](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L564)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:566](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L566)

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

### SetWeb2DelegateResult

Defined in: [types/web2.ts:574](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L574)

Result of setting a Web2 delegate.

#### Properties

##### success

> **success**: `boolean`

Defined in: [types/web2.ts:576](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L576)

Whether the operation succeeded

##### secretId

> **secretId**: `number`

Defined in: [types/web2.ts:578](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L578)

Secret ID

***

### RequestRotatePermitParams

Defined in: [types/web2.ts:597](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L597)

Parameters for requesting a key rotation permit (email+password auth).

#### Properties

##### action

> **action**: `"rotate"`

Defined in: [types/web2.ts:599](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L599)

Action type

##### email

> **email**: `string`

Defined in: [types/web2.ts:601](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L601)

Email address

##### password

> **password**: `string`

Defined in: [types/web2.ts:603](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L603)

Password

##### payload

> **payload**: `object`

Defined in: [types/web2.ts:605](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L605)

JSON payload with newPublicKey

###### newPublicKey

> **newPublicKey**: `string`

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:607](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L607)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:609](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L609)

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

### RequestTransferOrDelegatePermitParams

Defined in: [types/web2.ts:617](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L617)

Parameters for requesting a transfer or delegate permit (session auth).

#### Properties

##### action

> **action**: `"transfer"` \| `"delegate"`

Defined in: [types/web2.ts:619](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L619)

Action type ('transfer' or 'delegate')

##### session

> **session**: [`Web2Session`](#web2session)

Defined in: [types/web2.ts:621](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L621)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [types/web2.ts:623](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L623)

Secret ID

##### payload

> **payload**: `object`

Defined in: [types/web2.ts:625](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L625)

JSON payload (newOwnerPrincipalId or delegatePrincipalId)

###### newOwnerPrincipalId?

> `optional` **newOwnerPrincipalId**: `string`

###### delegatePrincipalId?

> `optional` **delegatePrincipalId**: `string`

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:627](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L627)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:629](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L629)

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

### RequestPermitResult

Defined in: [types/web2.ts:646](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L646)

Result of requesting a permit.

#### Properties

##### success

> **success**: `boolean`

Defined in: [types/web2.ts:648](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L648)

Whether the operation succeeded

##### permitId

> **permitId**: `string`

Defined in: [types/web2.ts:650](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L650)

Permit UUID

##### action

> **action**: [`PermitAction`](#permitaction)

Defined in: [types/web2.ts:652](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L652)

Action type

##### clusterId

> **clusterId**: `number`

Defined in: [types/web2.ts:654](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L654)

Cluster ID

##### expiresAt

> **expiresAt**: `string`

Defined in: [types/web2.ts:656](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L656)

ISO 8601 expiry timestamp

##### message

> **message**: `string`

Defined in: [types/web2.ts:658](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L658)

Server message

***

### PrincipalByEmailResult

Defined in: [types/web2.ts:670](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L670)

Result of looking up a principal by email.

#### Properties

##### principalId

> **principalId**: `string`

Defined in: [types/web2.ts:672](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L672)

The principal UUID

##### emailHex

> **emailHex**: `string`

Defined in: [types/web2.ts:674](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L674)

Hex-encoded email

***

### Web2BlackboxBaseParams

Defined in: [types/web2.ts:690](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L690)

Common parameters for Web2 blackbox wrapper calls.

#### Remarks

These wrappers automatically fill in `chainId`, `signer`, and
other session-derived values.

#### Properties

##### session

> **session**: [`Web2Session`](#web2session)

Defined in: [types/web2.ts:692](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L692)

Active Web2 session

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [types/web2.ts:694](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L694)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](#readclient-1)

Defined in: [types/web2.ts:696](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L696)

Read client (for freshness)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [types/web2.ts:698](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L698)

Custom fetch implementation

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

## Type Aliases

### Address

> **Address** = `` `0x${string}` ``

Defined in: [types/common.ts:29](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L29)

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

Defined in: [types/common.ts:44](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L44)

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

Defined in: [types/common.ts:55](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L55)

Generic hex string (0x-prefixed).

#### Remarks

Used for arbitrary hex-encoded data such as transaction calldata,
signatures, and encoded messages.

***

### ChainId

> **ChainId** = `number`

Defined in: [types/common.ts:69](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L69)

Chain ID as a number.

#### Remarks

Common chain IDs used with CIFER:
- `8453` - Base Mainnet (primary coordination chain; hosts ClusterRegistry)
- `752025` - Ternoa Mainnet (multichain peer)
- `11155111` - Ethereum Sepolia (testnet)
- `-1` - Web2 mode (see [WEB2\_CHAIN\_ID](#web2_chain_id))

***

### SecretId

> **SecretId** = `bigint`

Defined in: [types/common.ts:108](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L108)

Secret ID (uint256 on-chain, represented as bigint).

#### Remarks

Secret IDs are auto-incremented by the SecretsController contract
when new secrets are created.

***

### BlockNumber

> **BlockNumber** = `number`

Defined in: [types/common.ts:115](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L115)

Block number.

***

### OutputFormat

> **OutputFormat** = `"hex"` \| `"base64"`

Defined in: [types/common.ts:126](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L126)

Output format for blackbox encryption operations.

#### Remarks

- `'hex'` - Returns data as 0x-prefixed hex strings
- `'base64'` - Returns data as base64 encoded strings

***

### InputFormat

> **InputFormat** = `"hex"` \| `"base64"`

Defined in: [types/common.ts:137](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L137)

Input format for blackbox decryption operations.

#### Remarks

- `'hex'` - Input data is 0x-prefixed hex strings
- `'base64'` - Input data is base64 encoded strings

***

### JobStatus

> **JobStatus** = `"pending"` \| `"processing"` \| `"completed"` \| `"failed"` \| `"expired"`

Defined in: [types/common.ts:150](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L150)

Job status as returned by the blackbox.

#### Remarks

Job lifecycle:
1. `'pending'` - Job created, waiting to be processed
2. `'processing'` - Job is being processed
3. `'completed'` | `'failed'` | `'expired'` - Terminal states

***

### JobType

> **JobType** = `"encrypt"` \| `"decrypt"`

Defined in: [types/common.ts:157](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L157)

Job type as returned by the blackbox.

***

### TxExecutor()

> **TxExecutor** = (`intent`) => `Promise`\<[`TxExecutionResult`](#txexecutionresult)\>

Defined in: [types/tx-intent.ts:175](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/tx-intent.ts#L175)

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

***

### PermitAction

> **PermitAction** = `"rotate"` \| `"transfer"` \| `"delegate"`

Defined in: [types/web2.ts:590](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L590)

Permit action type.

***

### RequestPermitParams

> **RequestPermitParams** = [`RequestRotatePermitParams`](#requestrotatepermitparams) \| [`RequestTransferOrDelegatePermitParams`](#requesttransferordelegatepermitparams)

Defined in: [types/web2.ts:637](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/web2.ts#L637)

Combined permit request params.

## Variables

### CIFER\_ENCRYPTED\_ABI

> `const` **CIFER\_ENCRYPTED\_ABI**: readonly \[\{ `type`: `"function"`; `name`: `"CIFER_ENVELOPE_BYTES"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"pure"`; \}, \{ `type`: `"function"`; `name`: `"MAX_PAYLOAD_BYTES"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"pure"`; \}, \{ `type`: `"function"`; `name`: `"getCIFERMetadata"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; \}\]; `outputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}, \{ `name`: `"storedAtBlock"`; `type`: `"uint64"`; \}, \{ `name`: `"ciferHash"`; `type`: `"bytes32"`; \}, \{ `name`: `"encryptedMessageHash"`; `type`: `"bytes32"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"ciferDataExists"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; \}\]; `outputs`: readonly \[\{ `name`: `"exists"`; `type`: `"bool"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"event"`; `name`: `"CIFERDataStored"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; `indexed`: `true`; \}, \{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"cifer"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessage"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"ciferHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessageHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"CIFERDataUpdated"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; `indexed`: `true`; \}, \{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"cifer"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessage"`; `type`: `"bytes"`; `indexed`: `false`; \}, \{ `name`: `"ciferHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}, \{ `name`: `"encryptedMessageHash"`; `type`: `"bytes32"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"CIFERDataDeleted"`; `inputs`: readonly \[\{ `name`: `"dataId"`; `type`: `"bytes32"`; `indexed`: `true`; \}\]; \}\]

Defined in: [internal/abi/cifer-encrypted.ts:17](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/abi/cifer-encrypted.ts#L17)

Minimal ABI fragment for ICiferEncrypted interface

This ABI contains only the stable, common functions and events
that all contracts implementing ICiferEncrypted should have.

***

### CIFER\_ENVELOPE\_BYTES

> `const` **CIFER\_ENVELOPE\_BYTES**: `1104` = `1104`

Defined in: [internal/abi/cifer-encrypted.ts:88](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/abi/cifer-encrypted.ts#L88)

Constants for CIFER envelope sizes

***

### MAX\_PAYLOAD\_BYTES

> `const` **MAX\_PAYLOAD\_BYTES**: `16384` = `16384`

Defined in: [internal/abi/cifer-encrypted.ts:89](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/abi/cifer-encrypted.ts#L89)

***

### SECRETS\_CONTROLLER\_ABI

> `const` **SECRETS\_CONTROLLER\_ABI**: readonly \[\{ `type`: `"function"`; `name`: `"secretCreationFee"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"defaultSecretType"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint8"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"nextSecretId"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"uint256"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretState"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `outputs`: readonly \[\{ `name`: `"owner"`; `type`: `"address"`; \}, \{ `name`: `"delegate"`; `type`: `"address"`; \}, \{ `name`: `"isSyncing"`; `type`: `"bool"`; \}, \{ `name`: `"clusterId"`; `type`: `"uint8"`; \}, \{ `name`: `"secretType"`; `type`: `"uint8"`; \}, \{ `name`: `"publicKeyCid"`; `type`: `"string"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretOwner"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"address"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getDelegate"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `outputs`: readonly \[\{ `name`: `""`; `type`: `"address"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretsByWallet"`; `inputs`: readonly \[\{ `name`: `"wallet"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\{ `name`: `"owned"`; `type`: `"uint256[]"`; \}, \{ `name`: `"delegated"`; `type`: `"uint256[]"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"getSecretsCountByWallet"`; `inputs`: readonly \[\{ `name`: `"wallet"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\{ `name`: `"ownedCount"`; `type`: `"uint256"`; \}, \{ `name`: `"delegatedCount"`; `type`: `"uint256"`; \}\]; `stateMutability`: `"view"`; \}, \{ `type`: `"function"`; `name`: `"createSecret"`; `inputs`: readonly \[\]; `outputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}\]; `stateMutability`: `"payable"`; \}, \{ `type`: `"function"`; `name`: `"setDelegate"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}, \{ `name`: `"newDelegate"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\]; `stateMutability`: `"nonpayable"`; \}, \{ `type`: `"function"`; `name`: `"transferSecret"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; \}, \{ `name`: `"newOwner"`; `type`: `"address"`; \}\]; `outputs`: readonly \[\]; `stateMutability`: `"nonpayable"`; \}, \{ `type`: `"event"`; `name`: `"SecretCreated"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"owner"`; `type`: `"address"`; `indexed`: `true`; \}, \{ `name`: `"secretType"`; `type`: `"uint8"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"SecretSynced"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"clusterId"`; `type`: `"uint8"`; `indexed`: `true`; \}, \{ `name`: `"publicKeyCid"`; `type`: `"string"`; `indexed`: `false`; \}\]; \}, \{ `type`: `"event"`; `name`: `"DelegateUpdated"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"newDelegate"`; `type`: `"address"`; `indexed`: `true`; \}\]; \}, \{ `type`: `"event"`; `name`: `"SecretOwnershipTransferred"`; `inputs`: readonly \[\{ `name`: `"secretId"`; `type`: `"uint256"`; `indexed`: `true`; \}, \{ `name`: `"oldOwner"`; `type`: `"address"`; `indexed`: `true`; \}, \{ `name`: `"newOwner"`; `type`: `"address"`; `indexed`: `true`; \}\]; \}\]

Defined in: [internal/abi/secrets-controller.ts:12](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/abi/secrets-controller.ts#L12)

SecretsController ABI - user-facing subset for SDK
Excludes admin/internal functions (addWhitelistedBlackBox, markSecretSynced, etc.)

***

### WEB2\_CHAIN\_ID

> `const` **WEB2\_CHAIN\_ID**: `-1`

Defined in: [types/common.ts:81](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L81)

Sentinel chain ID for Web2 mode.

#### Remarks

When `chainId` is set to `WEB2_CHAIN_ID` (`-1`), the SDK uses
timestamp-based freshness (milliseconds) instead of block numbers,
and session-based EOA signatures instead of wallet signatures.

***

### PRIMARY\_CHAIN\_ID

> `const` **PRIMARY\_CHAIN\_ID**: `8453`

Defined in: [types/common.ts:87](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L87)

Primary coordination chain — hosts `CiferClusterRegistry` on blackbox/node.
Must match blackbox `PRIMARY_CHAIN_ID`.

***

### TERNOA\_CHAIN\_ID

> `const` **TERNOA\_CHAIN\_ID**: `752025`

Defined in: [types/common.ts:90](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L90)

Ternoa mainnet — ordinary multichain peer (no cluster registry).

***

### ON\_CHAIN\_PUBLIC\_KEY\_PLACEHOLDER

> `const` **ON\_CHAIN\_PUBLIC\_KEY\_PLACEHOLDER**: `"cifer"` = `'cifer'`

Defined in: [types/common.ts:97](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/types/common.ts#L97)

On-chain `publicKeyCid` value when blackbox does not use IPFS (no contract upgrade).

## Functions

### createCiferSdk()

> **createCiferSdk**(`config`): `Promise`\<[`CiferSdk`](#cifersdk)\>

Defined in: [index.ts:368](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L368)

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
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
```

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
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

Defined in: [index.ts:484](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/index.ts#L484)

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
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
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

> **createReadClientFromDiscovery**(`chains`, `options?`): [`RpcReadClient`](#rpcreadclient)

Defined in: [internal/adapters/rpc-read-client.ts:283](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/adapters/rpc-read-client.ts#L283)

Create a read client from discovery result

#### Parameters

##### chains

`object`[]

Array of chain configs from discovery

##### options?

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

#### Returns

[`RpcReadClient`](#rpcreadclient)

Configured RpcReadClient

#### Example

```typescript
const discovery = await discover('https://blackbox.cifersecurity.com:3010');
const readClient = createReadClientFromDiscovery(discovery.chains);
```

***

### getFreshBlockNumber()

> **getFreshBlockNumber**(`chainId`, `readClient`): `Promise`\<`number`\>

Defined in: [internal/auth/block-freshness.ts:56](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/block-freshness.ts#L56)

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

Defined in: [internal/auth/block-freshness.ts:116](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/block-freshness.ts#L116)

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

Defined in: [internal/auth/data-string.ts:27](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/data-string.ts#L27)

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

Defined in: [internal/auth/data-string.ts:42](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/data-string.ts#L42)

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

Defined in: [internal/auth/data-string.ts:66](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/data-string.ts#L66)

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

Defined in: [internal/auth/data-string.ts:90](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/data-string.ts#L90)

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

Defined in: [internal/auth/data-string.ts:112](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/data-string.ts#L112)

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

Defined in: [internal/auth/data-string.ts:137](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/data-string.ts#L137)

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

Defined in: [internal/auth/data-string.ts:163](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/data-string.ts#L163)

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

Defined in: [internal/auth/signer.ts:46](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/auth/signer.ts#L46)

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

Defined in: [internal/config/discovery.ts:81](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/discovery.ts#L81)

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
const discovery = await discover('https://blackbox.cifersecurity.com:3010');

console.log('Supported chains:', discovery.supportedChains);
// [1, 752025, 11155111, 43114, 8453]

const baseConfig = discovery.chains.find(c => c.chainId === 8453);
console.log('Base RPC:', baseConfig?.rpcUrl);

// Device clock integrity check (e.g. on app foreground)
if (discovery.serverTime !== undefined) {
  const skewMs = Math.abs(Date.now() - discovery.serverTime);
  if (skewMs > 10 * 60 * 1000) {
    // device clock is more than 10 minutes off — block the UI
  }
}
```

***

### clearDiscoveryCache()

> **clearDiscoveryCache**(`blackboxUrl?`): `void`

Defined in: [internal/config/discovery.ts:179](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/discovery.ts#L179)

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

Defined in: [internal/config/discovery.ts:191](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/discovery.ts#L191)

Get supported chain IDs from discovery result

#### Parameters

##### discovery

[`DiscoveryResult`](#discoveryresult)

#### Returns

`number`[]

***

### isChainSupported()

> **isChainSupported**(`discovery`, `chainId`): `boolean`

Defined in: [internal/config/discovery.ts:198](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/discovery.ts#L198)

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

Defined in: [internal/config/resolver.ts:43](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/resolver.ts#L43)

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

Defined in: [internal/config/resolver.ts:95](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/resolver.ts#L95)

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

Defined in: [internal/config/resolver.ts:131](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/resolver.ts#L131)

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

Defined in: [internal/config/resolver.ts:143](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/config/resolver.ts#L143)

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

Defined in: [internal/errors/index.ts:742](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L742)

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

Defined in: [internal/errors/index.ts:754](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L754)

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

Defined in: [internal/errors/index.ts:766](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L766)

Check if an error indicates the secret is not ready.

#### Parameters

##### error

`unknown`

The error to check

#### Returns

`error is SecretNotReadyError`

`true` if the error is an instance of [SecretNotReadyError](#secretnotreadyerror)

***

### isWeb2Error()

> **isWeb2Error**(`error`): `error is Web2Error`

Defined in: [internal/errors/index.ts:780](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L780)

Check if an error is a Web2-specific error.

#### Parameters

##### error

`unknown`

The error to check

#### Returns

`error is Web2Error`

`true` if the error is an instance of [Web2Error](#web2error)

***

### isWeb2SessionError()

> **isWeb2SessionError**(`error`): `error is Web2SessionError`

Defined in: [internal/errors/index.ts:792](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L792)

Check if an error is a Web2 session error.

#### Parameters

##### error

`unknown`

The error to check

#### Returns

`error is Web2SessionError`

`true` if the error is an instance of [Web2SessionError](#web2sessionerror)

***

### parseBlackboxErrorResponse()

> **parseBlackboxErrorResponse**(`response`, `statusCode`, `endpoint`): [`BlackboxError`](#blackboxerror)

Defined in: [internal/errors/index.ts:811](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/internal/errors/index.ts#L811)

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
