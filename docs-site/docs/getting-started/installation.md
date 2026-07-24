---
sidebar_position: 1
---

# Installation

Install the CIFER SDK using your preferred package manager.

:::tip Using AI Assistants?
Point your AI agent (ChatGPT, Claude, Cursor, etc.) to [`llm.txt`](/llm.txt) — a comprehensive plaintext reference designed for AI consumption. This helps agents understand the SDK and implement features more accurately.
:::

## Package Managers

```bash npm2yarn
npm install cifer-sdk
```

Or with yarn:

```bash
yarn add cifer-sdk
```

Or with pnpm:

```bash
pnpm add cifer-sdk
```

## Requirements

- **Node.js**: 18.0 or higher
- **TypeScript**: 5.0 or higher (recommended)
- **Environment**: Browser or Node.js

## TypeScript Configuration

The SDK is written in TypeScript and includes full type definitions. Add these compiler options to your `tsconfig.json` for the best experience:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "target": "ES2020",
    "lib": ["ES2020", "DOM"]
  }
}
```

## ESM and CommonJS

The SDK supports both ESM and CommonJS:

```typescript
// ESM (recommended)
import { createCiferSdk, keyManagement, blackbox } from 'cifer-sdk';

// CommonJS
const { createCiferSdk, keyManagement, blackbox } = require('cifer-sdk');
```

## Sub-path Exports

For tree-shaking and smaller bundles, you can import from specific sub-paths:

```typescript
// Import only what you need
import { Eip1193SignerAdapter, RpcReadClient } from 'cifer-sdk/adapters';
import { encryptPayload, decryptPayload } from 'cifer-sdk/blackbox';
import { buildCreateSecretTx } from 'cifer-sdk/keyManagement';
import * as web2 from 'cifer-sdk/web2'; // Web2 auth + session module
```

## Bundle Size

The SDK has **zero runtime dependencies** on wallet libraries. It depends only on `@noble/secp256k1` and `@noble/hashes` (audited, tree-shakeable, ~8KB combined gzipped) for the `PrivateKeySignerAdapter` used by Web2 sessions. Your bundle includes:

- Core SDK functions
- ABI encoders/decoders (minimal)
- Type definitions
- `@noble/secp256k1` + `@noble/hashes` (for `PrivateKeySignerAdapter`)

Typical bundle size: **~23KB** gzipped (depending on imports used). Web3-only consumers who don't import `PrivateKeySignerAdapter` or `web2` can tree-shake these away.

## Peer Dependencies

The SDK doesn't require any peer dependencies. It works with any wallet or provider that implements the standard EIP-1193 interface. For Web2 mode, you'll need your own Ed25519 library (e.g. `@noble/ed25519` or Node.js `crypto`).

## Verification

Verify your installation:

```typescript
import { createCiferSdk } from 'cifer-sdk';

async function verify() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  });
  
  console.log('Supported chains:', sdk.getSupportedChainIds());
  // Should print: [8453, ...]
}

verify();
```

## Next Steps

Now that you have the SDK installed, choose your path:

- [Quick Start (Web3)](/docs/getting-started/quick-start) - Get started with wallet-based encryption
- [Quick Start (Web2)](/docs/getting-started/quick-start-web2) - Get started with email + password (no wallet needed)
