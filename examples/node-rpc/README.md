# Node.js + RPC Example

This example demonstrates using `cifer-sdk` in a Node.js environment with direct RPC calls and an external transaction executor.

## Setup

```bash
npm install
# Set environment variables
export PRIVATE_KEY=0x...
export RPC_URL=https://...
npm start
```

## Key Concepts

1. **Server-side Signing**: Uses a custom signer that signs with a private key
2. **Direct RPC**: Uses `RpcReadClient` for blockchain queries
3. **External TX Executor**: Shows how to integrate with external transaction submission

## Files

- `index.ts` - Main script with encryption example
- `signer.ts` - Custom server-side signer implementation
