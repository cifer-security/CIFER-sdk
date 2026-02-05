---
sidebar_position: 1
---

# API Reference

:::info Auto-generated Documentation
This API reference is automatically generated from TypeScript source code using TypeDoc.

To regenerate, run:

```bash
npm run docs:typedoc
```
:::

## Overview

The CIFER SDK is organized into the following namespaces:

### Core Factory

- [`createCiferSdk`](./functions/createCiferSdk.md) - Create an SDK instance with auto-discovery
- [`createCiferSdkSync`](./functions/createCiferSdkSync.md) - Create an SDK instance synchronously

### Namespaces

| Namespace | Description |
|-----------|-------------|
| [`keyManagement`](./modules/keyManagement.md) | Secret creation, delegation, and ownership management |
| [`blackbox`](./modules/blackbox.md) | Encryption and decryption via the blackbox API |
| [`commitments`](./modules/commitments.md) | On-chain encrypted data storage and retrieval |
| [`flows`](./modules/flows.md) | High-level orchestrated operations |

### Adapters

| Class | Description |
|-------|-------------|
| [`Eip1193SignerAdapter`](./classes/Eip1193SignerAdapter.md) | Signer adapter for EIP-1193 wallets |
| [`RpcReadClient`](./classes/RpcReadClient.md) | Read client for JSON-RPC providers |

### Type Definitions

- [Common Types](./modules/types_common.md) - Address, ChainId, Hex, etc.
- [Adapter Types](./modules/types_adapters.md) - SignerAdapter, ReadClient
- [Config Types](./modules/types_config.md) - CiferSdkConfig, ChainConfig
- [Transaction Types](./modules/types_tx_intent.md) - TxIntent, TxIntentWithMeta

### Errors

All SDK errors extend [`CiferError`](./classes/CiferError.md):

| Error | Code | Description |
|-------|------|-------------|
| [`ConfigError`](./classes/ConfigError.md) | `CONFIG_ERROR` | Configuration issues |
| [`AuthError`](./classes/AuthError.md) | `AUTH_ERROR` | Authentication failures |
| [`BlackboxError`](./classes/BlackboxError.md) | `BLACKBOX_ERROR` | Blackbox API errors |
| [`KeyManagementError`](./classes/KeyManagementError.md) | `KEY_MANAGEMENT_ERROR` | SecretsController errors |
| [`CommitmentsError`](./classes/CommitmentsError.md) | `COMMITMENTS_ERROR` | Commitment errors |
| [`FlowError`](./classes/FlowError.md) | `FLOW_ERROR` | Flow execution errors |

## Importing

```typescript
// Main entry point
import { createCiferSdk, keyManagement, blackbox, commitments, flows } from 'cifer-sdk';

// Types
import type { Address, ChainId, SecretState, TxIntent } from 'cifer-sdk';

// Adapters
import { Eip1193SignerAdapter, RpcReadClient } from 'cifer-sdk';

// Errors
import { CiferError, isCiferError, isBlockStaleError } from 'cifer-sdk';
```

## Quick Links

- [Getting Started](/docs/getting-started/installation)
- [Guides](/docs/guides/key-management)
- [GitHub Repository](https://github.com/cifer-security/cifer-sdk)
