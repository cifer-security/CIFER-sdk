/**
 * Thirdweb client configuration for the Secrets Manager example.
 *
 * This module sets up the Thirdweb client and wallet configurations.
 * The app supports four wallet connection methods:
 * - Email (via Thirdweb in-app wallet)
 * - Google OAuth (via Thirdweb in-app wallet)
 * - Facebook OAuth (via Thirdweb in-app wallet)
 * - MetaMask (via external wallet)
 */

import { createThirdwebClient } from "thirdweb"
import { inAppWallet, createWallet } from "thirdweb/wallets"

// ------------------------------------------------------------------
// Thirdweb Client
// ------------------------------------------------------------------

/**
 * Create a Thirdweb client using the client ID from environment variables.
 * Get your client ID at https://thirdweb.com/dashboard
 */
export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
})

// ------------------------------------------------------------------
// Wallet Configurations
// ------------------------------------------------------------------

/**
 * Wallets enabled for the Secrets Manager.
 *
 * - inAppWallet: Supports email, Google, and Facebook sign-in.
 *   These create embedded wallets managed by Thirdweb, perfect for
 *   users who don't have a crypto wallet.
 *
 * - MetaMask: For users who already have a browser wallet extension.
 */
export const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "google", "facebook"],
    },
  }),
  createWallet("io.metamask"),
]
