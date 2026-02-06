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
 * SDK operations are split into sub-files for clarity:
 *   - fetch-fee.tsx        → getSecretCreationFee      (read)
 *   - get-secrets.tsx      → getSecretsByWallet        (read)
 *   - get-secret.tsx       → getSecret                 (read)
 *   - set-delegate.tsx     → buildSetDelegateTx        (write via Thirdweb Account)
 *   - remove-delegation.tsx→ buildRemoveDelegationTx   (write via Thirdweb Account)
 *   - transfer-secret.tsx  → buildTransferSecretTx     (write via Thirdweb Account)
 *   - encrypt-payload.tsx  → blackbox.payload.encrypt   (signer via Thirdweb Account)
 *   - decrypt-payload.tsx  → blackbox.payload.decrypt   (signer via Thirdweb Account)
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { truncateAddress } from "@/lib/utils"
import { getChainName } from "@/lib/chains"
import { ChevronDown } from "lucide-react"

// ---------------------------------------------------------------------------
// Thirdweb imports
// ---------------------------------------------------------------------------
import { createThirdwebClient } from "thirdweb"
import { defineChain } from "thirdweb/chains"
import {
  ThirdwebProvider,
  ConnectButton,
  useActiveAccount,
  useDisconnect,
  useActiveWallet,
} from "thirdweb/react"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import {
  createCiferSdk,
  type CiferSdk,
} from "cifer-sdk"

// ---------------------------------------------------------------------------
// We also import the Account type from thirdweb so we can type our adapter
// ---------------------------------------------------------------------------
import type { Account } from "thirdweb/wallets"

// ---------------------------------------------------------------------------
// Sub-components — each implements one SDK operation
// ---------------------------------------------------------------------------
import { FetchFee } from "./fetch-fee"
import { GetSecrets } from "./get-secrets"
import { GetSecret } from "./get-secret"
import { SetDelegate } from "./set-delegate"
import { RemoveDelegation } from "./remove-delegation"
import { TransferSecret } from "./transfer-secret"
import { EncryptPayload } from "./encrypt-payload"
import { DecryptPayload } from "./decrypt-payload"

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
// ⚠️  Custom Chain Definition — Ternoa (752025)
//
// Thirdweb's RPC proxy does NOT support every chain out of the box.
// For unsupported chains (e.g. Ternoa / 752025), you MUST define the
// chain explicitly with defineChain() including its RPC URL. Without
// this, Thirdweb will route requests to its own proxy which returns
// "Invalid chain".
//
// Developers integrating Thirdweb with Ternoa MUST include a definition
// like this in their project. Standard chains (Sepolia, Polygon, etc.)
// work fine with just `defineChain(chainId)`.
// ===========================================================================
const ternoaChain = defineChain({
  id: 752025,
  name: "Ternoa",
  nativeCurrency: {
    name: "CAPS",
    symbol: "CAPS",
    decimals: 18,
  },
  rpc: "https://rpc-mainnet.zkevm.ternoa.network/",
  blockExplorers: [
    {
      name: "Ternoa Explorer",
      url: "https://explorer-mainnet.zkevm.ternoa.network/",
    },
  ],
})

/**
 * Return the correct Thirdweb chain definition for a given chainId.
 *
 * For Ternoa (752025) we return the custom definition above.
 * For all other chains, defineChain(id) uses Thirdweb's built-in registry.
 *
 * This is passed to transaction sub-components so the Ternoa chain config
 * stays centralized here in page.tsx.
 */
function getThirdwebChain(chainId: number) {
  if (chainId === 752025) return ternoaChain
  return defineChain(chainId)
}

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
    async getAddress(): Promise<string> {
      return account.address
    },
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
  const [chainId, setChainId] = useState<number | null>(null)
  const [supportedChains, setSupportedChains] = useState<number[]>([])
  const [error, setError] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  // ---- Logger (shared with sub-components) ----
  const log = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ])
    console.log(`[Thirdweb Example] ${message}`)
  }, [])

  // =========================================================================
  // Step 1: Initialize the CIFER SDK
  // =========================================================================
  useEffect(() => {
    async function initSdk() {
      try {
        log("Initializing CIFER SDK with auto-discovery...")

        const sdkInstance = await createCiferSdk({
          blackboxUrl: BLACKBOX_URL,
          logger: (msg) => log(msg),
        })

        const chains = sdkInstance.getSupportedChainIds()
        log(`SDK ready. Supported chains: [${chains.join(", ")}]`)

        setSdk(sdkInstance)
        setSupportedChains(chains)

        if (chains.length > 0) {
          setChainId(chains[0])
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
  // Step 2: Wallet Connection — Thirdweb handles this via ConnectButton
  // =========================================================================
  useEffect(() => {
    if (account) {
      log(`Thirdweb wallet connected: ${account.address}`)

      // Show how the signer adapter would be created (for reference)
      const signer = createThirdwebSigner(account)
      signer.getAddress().then((addr) => {
        log(`Created signer adapter for: ${addr}`)
        log("(This signer can be passed to encrypt/decrypt functions)")
      })
    }
  }, [account, log])

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

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* ---- Left Column: Steps + SDK Operations ---- */}
            <div className="space-y-6">
              {/* Step 1: SDK Status + Chain Selector */}
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
                {/* Chain Selector */}
                {sdk && supportedChains.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                      Network
                    </label>
                    <div className="relative">
                      <select
                        value={chainId ?? ""}
                        onChange={(e) => {
                          const newChain = Number(e.target.value)
                          setChainId(newChain)
                          log(`Switched to ${getChainName(newChain)} (${newChain})`)
                        }}
                        className="
                          w-full appearance-none
                          bg-zinc-900 border border-zinc-800 rounded-lg
                          px-3 py-2 pr-8
                          text-sm text-white
                          hover:border-zinc-600
                          focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
                          transition-colors cursor-pointer
                        "
                      >
                        {supportedChains.map((id) => (
                          <option key={id} value={id}>
                            {getChainName(id)} ({id})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
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

              {/* ---- SDK Operations (sub-components) ---- */}
              {sdk && chainId && (
                <>
                  {/* Fetch Fee — read-only */}
                  <FetchFee sdk={sdk} chainId={chainId} log={log} />

                  {/* Get Secret — read-only, query by ID */}
                  <GetSecret sdk={sdk} chainId={chainId} log={log} />

                  {/* Get Secrets — read-only, needs wallet address */}
                  {account && (
                    <GetSecrets
                      sdk={sdk}
                      chainId={chainId}
                      address={account.address}
                      log={log}
                    />
                  )}

                  {/* Set Delegate — write, sends tx via Thirdweb Account */}
                  {account && (
                    <SetDelegate
                      sdk={sdk}
                      chainId={chainId}
                      account={account}
                      thirdwebClient={thirdwebClient}
                      getThirdwebChain={getThirdwebChain}
                      log={log}
                    />
                  )}

                  {/* Remove Delegation — write, sends tx via Thirdweb Account */}
                  {account && (
                    <RemoveDelegation
                      sdk={sdk}
                      chainId={chainId}
                      account={account}
                      thirdwebClient={thirdwebClient}
                      getThirdwebChain={getThirdwebChain}
                      log={log}
                    />
                  )}

                  {/* Transfer Secret — write, sends tx via Thirdweb Account */}
                  {account && (
                    <TransferSecret
                      sdk={sdk}
                      chainId={chainId}
                      account={account}
                      thirdwebClient={thirdwebClient}
                      getThirdwebChain={getThirdwebChain}
                      log={log}
                    />
                  )}

                  {/* Encrypt Payload — blackbox API, needs signer */}
                  {account && (
                    <EncryptPayload
                      sdk={sdk}
                      chainId={chainId}
                      account={account}
                      log={log}
                    />
                  )}

                  {/* Decrypt Payload — blackbox API, needs signer */}
                  {account && (
                    <DecryptPayload
                      sdk={sdk}
                      chainId={chainId}
                      account={account}
                      log={log}
                    />
                  )}
                </>
              )}
            </div>

            {/* ---- Right Column: Logs + Error (sticky so it follows scroll) ---- */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
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
                                entry.includes("fee:") ||
                                entry.includes("confirmed")
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
