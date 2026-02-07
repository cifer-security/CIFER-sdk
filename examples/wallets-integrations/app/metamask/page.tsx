/**
 * MetaMask Wallet Integration Example
 * ====================================
 *
 * This file demonstrates how to integrate MetaMask with the CIFER SDK.
 *
 * Key concepts:
 * 1. MetaMask injects an EIP-1193 provider at `window.ethereum`
 * 2. cifer-sdk provides `Eip1193SignerAdapter` that wraps any EIP-1193 provider
 * 3. No additional npm packages are needed for MetaMask — just the SDK
 *
 * Flow:
 * ┌─────────────────┐     ┌──────────────────────┐     ┌──────────────┐
 * │  window.ethereum │ ──▶ │ Eip1193SignerAdapter  │ ──▶ │  cifer-sdk   │
 * │  (MetaMask)      │     │ (from cifer-sdk)      │     │  functions   │
 * └─────────────────┘     └──────────────────────┘     └──────────────┘
 *
 * The Eip1193SignerAdapter implements the SDK's SignerAdapter interface:
 *   - getAddress(): Returns the connected wallet address
 *   - signMessage(message): Signs using EIP-191 personal_sign
 *
 * SDK operations are split into sub-files for clarity:
 *   - fetch-fee.tsx        → getSecretCreationFee      (read)
 *   - get-secrets.tsx      → getSecretsByWallet        (read)
 *   - get-secret.tsx       → getSecret                 (read)
 *   - set-delegate.tsx     → buildSetDelegateTx        (write via MetaMask)
 *   - remove-delegation.tsx→ buildRemoveDelegationTx   (write via MetaMask)
 *   - transfer-secret.tsx  → buildTransferSecretTx     (write via MetaMask)
 *   - encrypt-payload.tsx  → blackbox.payload.encrypt   (signer via MetaMask)
 *   - decrypt-payload.tsx  → blackbox.payload.decrypt   (signer via MetaMask)
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { truncateAddress } from "@/lib/utils"
import { getChainName } from "@/lib/chains"
import { ChevronDown } from "lucide-react"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import {
  createCiferSdk,
  Eip1193SignerAdapter,
  type CiferSdk,
} from "cifer-sdk"

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
// TypeScript: Extend Window to include MetaMask's ethereum provider
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

// ===========================================================================
// MetaMask Integration Page
// ===========================================================================

export default function MetaMaskPage() {
  // ---- State ----
  const [sdk, setSdk] = useState<CiferSdk | null>(null)
  const [address, setAddress] = useState<string>("")
  const [chainId, setChainId] = useState<number | null>(null)
  const [supportedChains, setSupportedChains] = useState<number[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  // ---- Logger (shared with sub-components) ----
  const log = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ])
    console.log(`[MetaMask Example] ${message}`)
  }, [])

  // =========================================================================
  // Step 1: Initialize the CIFER SDK
  //
  // createCiferSdk() performs "discovery" — it calls the Blackbox API's
  // /healthz endpoint to discover supported chains, RPC URLs, and contract
  // addresses. This means you don't need to hardcode any chain configuration.
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
  // Step 2: Connect MetaMask
  //
  // MetaMask injects `window.ethereum` — an EIP-1193 provider.
  // We request account access, then wrap the provider with the SDK's
  // Eip1193SignerAdapter which implements the SignerAdapter interface.
  // =========================================================================
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install the MetaMask browser extension.")
      return
    }

    try {
      setIsConnecting(true)
      setError("")
      log("Requesting MetaMask account access...")

      await window.ethereum.request({ method: "eth_requestAccounts" })

      const signer = new Eip1193SignerAdapter(window.ethereum)
      const walletAddress = await signer.getAddress()
      setAddress(walletAddress)

      log(`Connected: ${walletAddress}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Connection failed: ${message}`)
      log(`ERROR: ${message}`)
    } finally {
      setIsConnecting(false)
    }
  }, [log])

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
                <Wallet className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                EIP-1193
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-accent">MetaMask</span> Integration
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Connect MetaMask via{" "}
              <code className="text-zinc-300 font-mono text-sm bg-zinc-800/50 px-1.5 py-0.5 rounded">
                window.ethereum
              </code>{" "}
              and interact with the CIFER SDK. No extra packages needed.
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
                  The SDK is initialized with auto-discovery when the page loads.
                  It fetches supported chains and contract addresses from the
                  Blackbox API.
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
                        onChange={async (e) => {
                          const newChain = Number(e.target.value)
                          setChainId(newChain)
                          log(`Switched to ${getChainName(newChain)} (${newChain})`)

                          // Ask MetaMask to switch to the selected chain
                          if (window.ethereum && address) {
                            try {
                              await window.ethereum.request({
                                method: "wallet_switchEthereumChain",
                                params: [{ chainId: `0x${newChain.toString(16)}` }],
                              })
                              log(`MetaMask switched to chain ${newChain}`)
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : String(err)
                              log(`MetaMask chain switch failed: ${msg}`)
                            }
                          }
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
                  {address ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Connect MetaMask
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Request account access, then wrap{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    window.ethereum
                  </code>{" "}
                  with{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    Eip1193SignerAdapter
                  </code>.
                </p>
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`await window.ethereum.request({ method: 'eth_requestAccounts' });`}
                  <br />
                  {`const signer = new Eip1193SignerAdapter(window.ethereum);`}
                  <br />
                  {`const address = await signer.getAddress();`}
                </div>

                {address ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-[#00ff9d]" />
                    <span className="text-zinc-300">
                      {truncateAddress(address)}
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={connectWallet}
                    disabled={!sdk || isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        Connect MetaMask
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* ---- SDK Operations (sub-components) ---- */}
              {sdk && chainId && (
                <>
                  {/* Fetch Fee — read-only */}
                  <FetchFee sdk={sdk} chainId={chainId} log={log} />

                  {/* Get Secret — read-only, query by ID */}
                  <GetSecret sdk={sdk} chainId={chainId} log={log} />

                  {/* Get Secrets — read-only, needs wallet address */}
                  {address && (
                    <GetSecrets
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      log={log}
                    />
                  )}

                  {/* Set Delegate — write, sends tx via MetaMask */}
                  {address && (
                    <SetDelegate
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      log={log}
                    />
                  )}

                  {/* Remove Delegation — write, sends tx via MetaMask */}
                  {address && (
                    <RemoveDelegation
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      log={log}
                    />
                  )}

                  {/* Transfer Secret — write, sends tx via MetaMask */}
                  {address && (
                    <TransferSecret
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      log={log}
                    />
                  )}

                  {/* Encrypt Payload — blackbox API, needs signer */}
                  {address && (
                    <EncryptPayload
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      log={log}
                    />
                  )}

                  {/* Decrypt Payload — blackbox API, needs signer */}
                  {address && (
                    <DecryptPayload
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
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
                            : entry.includes("Connected") ||
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
