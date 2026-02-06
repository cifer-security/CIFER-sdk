"use client"

import type React from "react"
import { ThirdwebProvider as Thirdweb } from "thirdweb/react"

/**
 * ThirdwebProvider wrapper for the application.
 *
 * This wraps the entire app to enable Thirdweb hooks like:
 * - useActiveAccount() - Get the connected wallet account
 * - useActiveWallet() - Get the active wallet instance
 * - useDisconnect() - Disconnect the wallet
 *
 * Must be a client component ("use client") since ThirdwebProvider uses React context.
 */
export function ThirdwebProvider({ children }: { children: React.ReactNode }) {
  return <Thirdweb>{children}</Thirdweb>
}
