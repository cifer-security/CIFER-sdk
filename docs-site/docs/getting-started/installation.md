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
```

## Bundle Size

The SDK has **zero runtime dependencies** on wallet libraries. Your bundle only includes:

- Core SDK functions
- ABI encoders/decoders (minimal)
- Type definitions

Typical bundle size: **~15KB** gzipped (depending on imports used).

## Peer Dependencies

The SDK doesn't require any peer dependencies. It works with any wallet or provider that implements the standard EIP-1193 interface.

## Verification

Verify your installation:

```typescript
import { createCiferSdk } from 'cifer-sdk';

async function verify() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010.network',
  });
  
  console.log('Supported chains:', sdk.getSupportedChainIds());
  // Should print: [752025, ...]
}

verify();
```

## Next Steps

Now that you have the SDK installed, proceed to the [Quick Start](/docs/getting-started/quick-start) guide.
