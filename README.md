# cifer-sdk

The official JavaScript/TypeScript SDK for CIFER (Cryptographic Infrastructure for Encrypted Records).

CIFER provides quantum-resistant encryption for blockchain applications using ML-KEM-768 key encapsulation and AES-GCM symmetric encryption.

## Features

- 🔐 **Quantum-resistant encryption** via ML-KEM-768 (NIST post-quantum standard)
- 🌐 **Multi-chain support** with automatic discovery
- 💼 **Wallet agnostic** - works with any EIP-1193 provider (MetaMask, WalletConnect, Coinbase, etc.)
- 📦 **Zero wallet dependencies** - bring your own wallet stack (ethers, viem, wagmi, or vanilla JS)
- 🔄 **Transaction intent pattern** - you control transaction execution
- 📁 **File encryption** with async job system for files of any size
- ⛓️ **On-chain commitments** with log-based retrieval and integrity verification
- 🏃 **High-level flows** for common operations
- ✉️ **Web2 Support** - Use email + password registration with session-based authentication (no wallet needed)

## Web3 and Web2 Support

CIFER SDK supports both Web3 and Web2 authentication methods:

- **Web3**: Use blockchain wallets (MetaMask, WalletConnect, Coinbase, or any EIP-1193 wallet) for authentication and transaction signing
- **Web2**: Use email + password registration with session-based authentication. Perfect for traditional web apps and server-side applications that don't require blockchain wallets

Both authentication methods use the same Blackbox encryption pipeline, ensuring consistent quantum-resistant security regardless of your authentication choice.

## Installation

```bash
npm install cifer-sdk
# or
yarn add cifer-sdk
# or
pnpm add cifer-sdk
```

## Documentation

Full documentation, guides, and API reference are available at **[sdk.cifer-security.com](https://sdk.cifer-security.com/)**.

## Examples

| Example | Description | Link |
| --- | --- | --- |
| [Next.js + EIP-1193](./examples/nextjs-eip1193/) | Browser wallet integration with any EIP-1193 provider (MetaMask, WalletConnect, etc.) | [View on GitHub](https://github.com/cifer-security/cifer-sdk/tree/main/examples/nextjs-eip1193) |
| [Node.js + RPC](./examples/node-rpc/) | Server-side usage with direct RPC calls and external transaction executor | [View on GitHub](https://github.com/cifer-security/cifer-sdk/tree/main/examples/node-rpc) |
| [Wallet Integrations](./examples/wallets-integrations/) | Multi-wallet demo with MetaMask, Thirdweb, and WalletConnect | [View on GitHub](https://github.com/cifer-security/cifer-sdk/tree/main/examples/wallets-integrations) |
| [Secrets Manager](./examples/nextjs-secrets-manager/) | Next.js app for managing secrets — create, delegate, transfer with Thirdweb | [View on GitHub](https://github.com/cifer-security/cifer-sdk/tree/main/examples/nextjs-secrets-manager) |
| [Web2 Integration](./examples/web2-integration/) | Email + password auth — demonstrates all Web2 SDK functions (no wallet needed) | [View on GitHub](https://github.com/cifer-security/cifer-sdk/tree/main/examples/web2-integration) |

## Core Concepts

### Discovery

The SDK uses automatic discovery to fetch chain configurations from the blackbox API. You can get supported chains, contract addresses, and RPC URLs for each chain. Chain configurations can be overridden if needed.

### Wallet Abstraction

The SDK uses a minimal `SignerAdapter` interface that works with any wallet. Built-in adapters are provided for EIP-1193 providers, and you can create custom signers for any wallet implementation.

### Transaction Intent Pattern

The SDK returns transaction intents instead of executing transactions directly. This gives you full control over transaction execution using your preferred method (ethers, wagmi, viem, or direct RPC calls).

## Namespaces

### keyManagement

Interact with the SecretsController contract to create secrets, check readiness, manage delegates, transfer ownership, and query secret states.

### blackbox

Encrypt and decrypt data via the blackbox API. Supports both small payloads (< 16KB) and large files through an async job system.

### commitments

Work with on-chain encrypted commitments. Read metadata, fetch encrypted data from logs, verify integrity, and build store transactions.

### flows

High-level orchestrated operations that combine multiple SDK functions for common workflows like creating secrets and waiting for readiness, encrypting and preparing commit transactions, and retrieving and decrypting from logs.

### web2

Web2-specific functions for email + password authentication, session management, and all encryption/decryption operations without requiring a blockchain wallet.

## Error Handling

All SDK errors extend `CiferError` with typed subclasses. Errors include programmatic error codes, human-readable messages, and error chaining for debugging.

## TypeScript Support

The SDK is written in TypeScript with full type exports and comprehensive JSDoc comments.


## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## Support

- [Documentation](https://sdk.cifer-security.com/) - Guides, API reference, and tutorials
- [GitHub Issues](https://github.com/cifer-security/cifer-sdk/issues) - Report bugs or request features
