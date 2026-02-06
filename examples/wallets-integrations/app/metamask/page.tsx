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
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { truncateAddress, formatWei } from "@/lib/utils"

// ---------------------------------------------------------------------------
// cifer-sdk imports
//
// - createCiferSdk: Factory function to initialize the SDK with auto-discovery
// - Eip1193SignerAdapter: Wraps any EIP-1193 provider into a cifer-sdk signer
// - keyManagement: Namespace containing secret management functions
// - CiferSdk: TypeScript type for the SDK instance
// ---------------------------------------------------------------------------
import {
  createCiferSdk,
  Eip1193SignerAdapter,
  keyManagement,
  type CiferSdk,
} from "cifer-sdk"

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
  const [fee, setFee] = useState<bigint | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isFetchingFee, setIsFetchingFee] = useState(false)
  const [error, setError] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  // ---- Logger ----
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

        // After discovery, the SDK knows which chains are supported
        const supportedChains = sdkInstance.getSupportedChainIds()
        log(`SDK ready. Supported chains: [${supportedChains.join(", ")}]`)

        setSdk(sdkInstance)

        // Use the first supported chain for this example
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
  // Step 2: Connect MetaMask
  //
  // MetaMask injects `window.ethereum` — an EIP-1193 provider.
  // We request account access, then wrap the provider with the SDK's
  // Eip1193SignerAdapter which implements the SignerAdapter interface.
  //
  // The SignerAdapter interface only needs two methods:
  //   - getAddress(): Promise<string>
  //   - signMessage(message: string): Promise<string>
  //
  // Eip1193SignerAdapter handles both of these automatically using
  // eth_accounts and personal_sign.
  // =========================================================================
  const connectWallet = useCallback(async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      setError("MetaMask not found. Please install the MetaMask browser extension.")
      return
    }

    try {
      setIsConnecting(true)
      setError("")
      log("Requesting MetaMask account access...")

      // Request account access — this triggers the MetaMask popup
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Create the signer adapter from the EIP-1193 provider.
      // This is the key integration point: Eip1193SignerAdapter wraps
      // window.ethereum so the CIFER SDK can use it for signing.
      const signer = new Eip1193SignerAdapter(window.ethereum)

      // Get the connected address
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
  // Step 3: Call getSecretCreationFee()
  //
  // This demonstrates calling an SDK read function. getSecretCreationFee()
  // reads from the SecretsController smart contract to get the fee (in wei)
  // required to create a new CIFER secret.
  //
  // Parameters:
  //   - chainId: The blockchain network ID
  //   - controllerAddress: The SecretsController contract address
  //     (auto-discovered by the SDK)
  //   - readClient: The RPC client for making on-chain calls
  //     (auto-created by the SDK during discovery)
  // =========================================================================
  const fetchFee = useCallback(async () => {
    if (!sdk || !chainId) return

    try {
      setIsFetchingFee(true)
      setError("")
      log(`Reading secret creation fee on chain ${chainId}...`)

      // Get the controller address for this chain.
      // This was discovered automatically during SDK initialization.
      const controllerAddress = sdk.getControllerAddress(chainId)
      log(`Controller address: ${controllerAddress}`)
      console.log("sdk", sdk)
      console.log("sdk.readClient", sdk.readClient)
      // Call the SDK's getSecretCreationFee function.
      // This reads the secretCreationFee() view function on the contract.
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
  }, [sdk, chainId, log])

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
              and call{" "}
              <code className="text-zinc-300 font-mono text-sm bg-zinc-800/50 px-1.5 py-0.5 rounded">
                getSecretCreationFee()
              </code>{" "}
              from the CIFER SDK. No extra packages needed.
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
                  to read the on-chain fee required to create a new secret.
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
                    disabled={!sdk || !address || isFetchingFee}
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
                            : entry.includes("Connected") ||
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
