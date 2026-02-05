# Next.js + EIP-1193 Example

This example demonstrates using `cifer-sdk` in a Next.js application with a generic EIP-1193 wallet provider (MetaMask, WalletConnect, etc.).

## Setup

```bash
npm install
npm run dev
```

## Key Concepts

1. **Wallet Abstraction**: Uses `Eip1193SignerAdapter` which works with any EIP-1193 provider
2. **Discovery**: Automatically fetches chain configuration from the blackbox
3. **Transaction Execution**: App handles transaction broadcasting via wagmi/ethers/direct RPC

## Files

- `page.tsx` - Main component with encryption/decryption flow
- `hooks.ts` - Custom hooks for SDK integration
