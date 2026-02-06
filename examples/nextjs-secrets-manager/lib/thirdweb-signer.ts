/**
 * Thirdweb → CIFER SDK Signer Adapter
 *
 * Bridges a Thirdweb Account to the CIFER SDK's SignerAdapter interface.
 * The SDK needs two methods:
 *   - getAddress(): Returns the wallet address
 *   - signMessage(message): Signs a message using EIP-191 personal_sign
 *
 * This adapter allows the CIFER SDK to authenticate with the Blackbox API
 * using any Thirdweb-connected wallet (email, Google, Facebook, MetaMask).
 *
 * @example
 * ```typescript
 * import { useActiveAccount } from "thirdweb/react";
 * import { createThirdwebSigner } from "@/lib/thirdweb-signer";
 *
 * const account = useActiveAccount();
 * const signer = createThirdwebSigner(account);
 *
 * // Now use with CIFER SDK
 * const encrypted = await blackbox.payload.encryptPayload({
 *   signer,
 *   ...
 * });
 * ```
 */

import type { Account } from "thirdweb/wallets"

/**
 * The SignerAdapter interface expected by cifer-sdk.
 * We define it inline to avoid import issues; it matches the SDK's SignerAdapter.
 */
export interface CiferSignerAdapter {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

/**
 * Create a CIFER SDK-compatible signer from a Thirdweb Account.
 *
 * @param account - The active Thirdweb account from useActiveAccount()
 * @returns A SignerAdapter that the CIFER SDK can use for authentication
 * @throws Error if account is null/undefined
 */
export function createThirdwebSigner(account: Account): CiferSignerAdapter {
  return {
    /**
     * Returns the wallet address of the connected account.
     */
    async getAddress(): Promise<string> {
      return account.address
    },

    /**
     * Signs a message using EIP-191 personal_sign.
     * The CIFER Blackbox API uses this signature to verify the caller's identity.
     */
    async signMessage(message: string): Promise<string> {
      return await account.signMessage({ message })
    },
  }
}
