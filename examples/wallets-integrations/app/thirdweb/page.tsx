/**
 * Thirdweb Wallet Integration Example
 * =====================================
 *
 * This file demonstrates how to integrate Thirdweb wallets with the CIFER SDK.
 *
 * Key concepts:
 * 1. Thirdweb provides a ConnectButton and React hooks for wallet management
 * 2. Thirdweb wallets use an Account object (not EIP-1193 directly)
 * 3. We build a custom signer adapter that bridges Thirdweb → cifer-sdk
 *
 * Flow:
 * ┌───────────────────┐     ┌─────────────────────────┐     ┌──────────────┐
 * │  Thirdweb Account  │ ──▶ │  Custom Signer Adapter  │ ──▶ │  cifer-sdk   │
 * │  (useActiveAccount)│     │  (defined in this file)  │     │  functions   │
 * └───────────────────┘     └─────────────────────────┘     └──────────────┘
 *
 * The custom signer adapter maps:
 *   - getAddress() → account.address
 *   - signMessage(msg) → account.signMessage({ message: msg })
 *
 * Thirdweb supports multiple connection methods:
 *   - Email / phone
 *   - Social login (Google, Facebook, etc.)
 *   - External wallets (MetaMask, Coinbase, etc.)
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { truncateAddress, formatWei } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Thirdweb imports
//
// - createThirdwebClient: Creates a Thirdweb client instance
// - ThirdwebProvider: React context provider for Thirdweb hooks
// - ConnectButton: Pre-built wallet connection UI component
// - useActiveAccount: Hook to get the currently connected account
// - useDisconnect: Hook to disconnect the wallet
// - useActiveWallet: Hook to get the active wallet instance
// ---------------------------------------------------------------------------
import { createThirdwebClient } from "thirdweb"
import {
  ThirdwebProvider,
  ConnectButton,
  useActiveAccount,
  useDisconnect,
  useActiveWallet,
} from "thirdweb/react"

// ---------------------------------------------------------------------------
// cifer-sdk imports
//
// - createCiferSdk: Factory to initialize the SDK with auto-discovery
// - keyManagement: Namespace for secret management functions
// - CiferSdk: TypeScript type for the SDK instance
// ---------------------------------------------------------------------------
import {
  createCiferSdk,
  keyManagement,
  type CiferSdk,
} from "cifer-sdk"

// ---------------------------------------------------------------------------
// We also import the Account type from thirdweb so we can type our adapter
// ---------------------------------------------------------------------------
import type { Account } from "thirdweb/wallets"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The Blackbox API URL used for SDK discovery */
const BLACKBOX_URL = "https://cifer-blackbox.ternoa.dev:3010"

// ---------------------------------------------------------------------------
// Create the Thirdweb client.
// You need a client ID from https://thirdweb.com/dashboard
// Set it as NEXT_PUBLIC_THIRDWEB_CLIENT_ID in your .env.local file.
// ---------------------------------------------------------------------------
const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
})

// ===========================================================================
// Custom Signer Adapter: Thirdweb Account → cifer-sdk SignerAdapter
//
// The cifer-sdk needs a signer that implements:
//   - getAddress(): Promise<string>
//   - signMessage(message: string): Promise<string>
//
// Thirdweb's Account object has:
//   - account.address (a string, not async)
//   - account.signMessage({ message }) (returns a Promise<Hex>)
//
// This adapter bridges the two interfaces.
// ===========================================================================

/**
 * The SignerAdapter interface expected by cifer-sdk.
 * Defined inline to avoid import issues.
 */
interface CiferSignerAdapter {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

/**
 * Create a cifer-sdk compatible signer from a Thirdweb Account.
 *
 * @param account - The active Thirdweb account from useActiveAccount()
 * @returns A SignerAdapter that the CIFER SDK can use for authentication
 */
function createThirdwebSigner(account: Account): CiferSignerAdapter {
  return {
    // Return the wallet address (Thirdweb provides it synchronously,
    // but cifer-sdk expects a Promise)
    async getAddress(): Promise<string> {
      return account.address
    },

    // Sign a message using EIP-191 personal_sign.
    // The CIFER Blackbox API uses this signature to verify the caller.
    async signMessage(message: string): Promise<string> {
      return await account.signMessage({ message })
    },
  }
}

// ===========================================================================
// Inner Component (uses Thirdweb hooks — must be inside ThirdwebProvider)
// ===========================================================================

function ThirdwebIntegration() {
  // ---- Thirdweb hooks ----
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()

  // ---- State ----
  const [sdk, setSdk] = useState<CiferSdk | null>(null)
  const [fee, setFee] = useState<bigint | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isFetchingFee, setIsFetchingFee] = useState(false)
  const [error, setError] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  // ---- Logger ----
  const log = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ])
    console.log(`[Thirdweb Example] ${message}`)
  }, [])

  // =========================================================================
  // Step 1: Initialize the CIFER SDK
  //
  // Same as MetaMask — createCiferSdk() with auto-discovery.
  // The SDK initialization is wallet-agnostic.
  // =========================================================================
  useEffect(() => {
    async function initSdk() {
      try {
        log("Initializing CIFER SDK with auto-discovery...")

        const sdkInstance = await createCiferSdk({
          blackboxUrl: BLACKBOX_URL,
          logger: (msg) => log(msg),
        })

        const supportedChains = sdkInstance.getSupportedChainIds()
        log(`SDK ready. Supported chains: [${supportedChains.join(", ")}]`)

        setSdk(sdkInstance)

        if (supportedChains.length > 0) {
          setChainId(supportedChains[0])
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(`Failed to initialize SDK: ${message}`)
        log(`ERROR: ${message}`)
      }
    }

    initSdk()
  }, [log])

  // =========================================================================
  // Step 2: Wallet Connection
  //
  // Thirdweb handles connection via the ConnectButton component.
  // When the user connects, useActiveAccount() returns the Account object.
  // We log when the account changes.
  // =========================================================================
  useEffect(() => {
    if (account) {
      log(`Thirdweb wallet connected: ${account.address}`)
    }
  }, [account, log])

  // =========================================================================
  // Step 3: Call getSecretCreationFee()
  //
  // This is the same SDK call as MetaMask — the only difference is how
  // we created the signer. Note that getSecretCreationFee() is a read-only
  // call, so it doesn't actually need a signer. We include the signer
  // adapter creation here to show the complete integration pattern.
  // =========================================================================
  const fetchFee = useCallback(async () => {
    if (!sdk || !chainId) return

    try {
      setIsFetchingFee(true)
      setError("")

      // Show how the signer adapter would be created (for reference)
      if (account) {
        const signer = createThirdwebSigner(account)
        const addr = await signer.getAddress()
        log(`Created signer adapter for: ${addr}`)
        log("(This signer can be passed to encrypt/decrypt functions)")
      }

      log(`Reading secret creation fee on chain ${chainId}...`)

      const controllerAddress = sdk.getControllerAddress(chainId)
      log(`Controller address: ${controllerAddress}`)

      // Call getSecretCreationFee — a read-only on-chain call
      const creationFee = await keyManagement.getSecretCreationFee({
        chainId,
        controllerAddress,
        readClient: sdk.readClient,
      })

      setFee(creationFee)
      log(`Secret creation fee: ${creationFee} wei (${formatWei(creationFee)} CAPS)`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Failed to fetch fee: ${message}`)
      log(`ERROR: ${message}`)
    } finally {
      setIsFetchingFee(false)
    }
  }, [sdk, chainId, account, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="page-bg min-h-screen">
      <div className="py-12">
        <Container>
          {/* ---- Back Navigation ---- */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#00ff9d] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Wallet Selection
          </Link>

          {/* ---- Page Header ---- */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Shield className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Thirdweb SDK
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-accent">Thirdweb</span> Integration
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Connect using Thirdweb&apos;s{" "}
              <code className="text-zinc-300 font-mono text-sm bg-zinc-800/50 px-1.5 py-0.5 rounded">
                ConnectButton
              </code>{" "}
              and bridge the Account to cifer-sdk with a custom signer adapter.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* ---- Left Column: Steps ---- */}
            <div className="space-y-6">
              {/* Step 1: SDK Status */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    Step 1
                  </span>
                  {sdk ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-zinc-500 animate-spin" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Initialize SDK
                </h3>
                <p className="text-sm text-zinc-400 mb-3">
                  SDK initialization is the same regardless of wallet type.
                  Auto-discovery fetches chain configs from the Blackbox API.
                </p>
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3">
                  {`const sdk = await createCiferSdk({`}
                  <br />
                  {`  blackboxUrl: '${BLACKBOX_URL}',`}
                  <br />
                  {`});`}
                </div>
                {sdk && chainId && (
                  <p className="text-xs text-zinc-500 mt-3">
                    Using chain: <span className="text-zinc-300">{chainId}</span>
                  </p>
                )}
              </div>

              {/* Step 2: Connect Wallet */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    Step 2
                  </span>
                  {account ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Connect via Thirdweb
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Thirdweb provides a{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    ConnectButton
                  </code>{" "}
                  component. After connection, use{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    useActiveAccount()
                  </code>{" "}
                  to get the Account, then build a custom signer adapter.
                </p>
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`// Custom signer adapter`}
                  <br />
                  {`function createThirdwebSigner(account: Account) {`}
                  <br />
                  {`  return {`}
                  <br />
                  {`    async getAddress() { return account.address },`}
                  <br />
                  {`    async signMessage(msg) {`}
                  <br />
                  {`      return account.signMessage({ message: msg })`}
                  <br />
                  {`    },`}
                  <br />
                  {`  };`}
                  <br />
                  {`}`}
                </div>

                {/* Thirdweb ConnectButton */}
                <div className="flex items-center gap-4">
                  <ConnectButton client={thirdwebClient} />
                  {account && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-[#00ff9d]" />
                      <span className="text-zinc-300">
                        {truncateAddress(account.address)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Fetch Fee */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    Step 3
                  </span>
                  {fee !== null ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Get Secret Creation Fee
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Call{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    keyManagement.getSecretCreationFee()
                  </code>{" "}
                  — a read-only on-chain call. Same API as MetaMask.
                </p>
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const fee = await keyManagement.getSecretCreationFee({`}
                  <br />
                  {`  chainId,`}
                  <br />
                  {`  controllerAddress: sdk.getControllerAddress(chainId),`}
                  <br />
                  {`  readClient: sdk.readClient,`}
                  <br />
                  {`});`}
                </div>

                {fee !== null ? (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Creation Fee</p>
                    <p className="text-2xl font-bold text-white">
                      {formatWei(fee)}{" "}
                      <span className="text-sm text-zinc-400 font-normal">
                        CAPS
                      </span>
                    </p>
                    <p className="text-xs text-zinc-600 font-mono mt-1">
                      {fee.toString()} wei
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={fetchFee}
                    disabled={!sdk || !account || isFetchingFee}
                  >
                    {isFetchingFee ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Reading contract...
                      </>
                    ) : (
                      "Fetch Fee"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* ---- Right Column: Logs + Error ---- */}
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="glow-card-subtle p-4 border-l-2 border-red-500/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Console Logs */}
              <div className="glow-card p-6">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Console Output
                </h3>
                <div className="bg-zinc-950 rounded-lg p-4 h-[500px] overflow-auto font-mono text-xs leading-relaxed">
                  {logs.length === 0 ? (
                    <p className="text-zinc-600">Waiting for SDK init...</p>
                  ) : (
                    logs.map((entry, i) => (
                      <div
                        key={i}
                        className={`${
                          entry.includes("ERROR")
                            ? "text-red-400"
                            : entry.includes("connected") ||
                                entry.includes("ready") ||
                                entry.includes("fee:")
                              ? "text-[#00ff9d]"
                              : "text-zinc-400"
                        }`}
                      >
                        {entry}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

// ===========================================================================
// Page Export (wraps with ThirdwebProvider)
//
// ThirdwebProvider must wrap any component that uses Thirdweb hooks like
// useActiveAccount(), ConnectButton, etc. We wrap it here at the page level
// so ALL the integration code stays in this single file.
// ===========================================================================

export default function ThirdwebPage() {
  return (
    <ThirdwebProvider>
      <ThirdwebIntegration />
    </ThirdwebProvider>
  )
}
