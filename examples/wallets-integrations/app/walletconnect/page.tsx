/**
 * WalletConnect v2 Integration Example
 * ======================================
 *
 * This file demonstrates how to integrate WalletConnect v2 with the CIFER SDK.
 *
 * Key concepts:
 * 1. WalletConnect creates an EIP-1193 provider via @walletconnect/ethereum-provider
 * 2. The user scans a QR code with a mobile wallet to connect
 * 3. Once connected, the provider works exactly like MetaMask's window.ethereum
 * 4. We wrap the WalletConnect provider with cifer-sdk's Eip1193SignerAdapter
 *
 * Flow:
 * ┌─────────────────────────┐     ┌──────────────────────┐     ┌──────────────┐
 * │  WalletConnect Provider  │ ──▶ │ Eip1193SignerAdapter  │ ──▶ │  cifer-sdk   │
 * │  (@walletconnect/        │     │ (from cifer-sdk)      │     │  functions   │
 * │   ethereum-provider)     │     │                       │     │              │
 * └─────────────────────────┘     └──────────────────────┘     └──────────────┘
 *
 * SDK operations are split into sub-files for clarity:
 *   - fetch-fee.tsx        → getSecretCreationFee      (read)
 *   - get-secrets.tsx      → getSecretsByWallet        (read)
 *   - get-secret.tsx       → getSecret                 (read)
 *   - create-secret.tsx    → buildCreateSecretTx       (write via WalletConnect)
 *   - set-delegate.tsx     → buildSetDelegateTx        (write via WalletConnect)
 *   - remove-delegation.tsx→ buildRemoveDelegationTx   (write via WalletConnect)
 *   - transfer-secret.tsx  → buildTransferSecretTx     (write via WalletConnect)
 *   - encrypt-payload.tsx  → blackbox.payload.encrypt   (signer via WalletConnect)
 *   - decrypt-payload.tsx  → blackbox.payload.decrypt   (signer via WalletConnect)
 *
 * Note: WalletConnect requires a Project ID from https://cloud.walletconnect.com
 * Set it as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local file.
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Globe, CheckCircle, Loader2, AlertCircle } from "lucide-react"
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
// WalletConnect imports
// ---------------------------------------------------------------------------
import EthereumProvider from "@walletconnect/ethereum-provider"

// ---------------------------------------------------------------------------
// Sub-components — each implements one SDK operation
// ---------------------------------------------------------------------------
import { FetchFee } from "./fetch-fee"
import { GetSecrets } from "./get-secrets"
import { GetSecret } from "./get-secret"
import { CreateSecret } from "./create-secret"
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

/**
 * WalletConnect Project ID — get one from https://cloud.walletconnect.com
 * Set as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local
 */
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// ===========================================================================
// WalletConnect Integration Page
// ===========================================================================

export default function WalletConnectPage() {
  // ---- State ----
  const [sdk, setSdk] = useState<CiferSdk | null>(null)
  const [address, setAddress] = useState<string>("")
  const [chainId, setChainId] = useState<number | null>(null)
  const [supportedChains, setSupportedChains] = useState<number[]>([])
  const [wcUri, setWcUri] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  // Keep a ref to the WalletConnect provider so we can pass it to sub-components
  const wcProviderRef = useRef<InstanceType<typeof EthereumProvider> | null>(null)

  // ---- Logger (shared with sub-components) ----
  const log = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ])
    console.log(`[WalletConnect Example] ${message}`)
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
  // Step 2: Connect WalletConnect
  //
  // WalletConnect v2 flow:
  // 1. Create an EthereumProvider with your project ID and supported chains
  // 2. Listen for the "display_uri" event to get the QR code URI
  // 3. Call provider.enable() to start the connection
  // 4. User scans the QR code with their mobile wallet
  // 5. Once connected, the provider is EIP-1193 compatible
  // 6. Wrap with Eip1193SignerAdapter — same as MetaMask!
  // =========================================================================
  const connectWallet = useCallback(async () => {
    if (!WC_PROJECT_ID) {
      setError(
        "WalletConnect Project ID not set. Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env.local"
      )
      return
    }

    try {
      setIsConnecting(true)
      setError("")
      log("Creating WalletConnect provider...")

      const provider = await EthereumProvider.init({
        projectId: WC_PROJECT_ID,
        chains: [1],
        optionalChains: chainId ? [chainId] : [752025],
        showQrModal: true,
        metadata: {
          name: "CIFER SDK — Wallet Integrations Example",
          description: "Demonstrating WalletConnect + CIFER SDK integration",
          url: "https://cifer-security.com",
          icons: [],
        },
      })

      wcProviderRef.current = provider

      provider.on("display_uri", (uri: string) => {
        setWcUri(uri)
        log("WalletConnect URI generated — scan with your mobile wallet")
      })

      log("Waiting for wallet connection (scan QR code)...")
      const accounts = await provider.enable()

      if (accounts.length === 0) {
        throw new Error("No accounts returned from WalletConnect")
      }

      const signer = new Eip1193SignerAdapter(provider as any)
      const walletAddress = await signer.getAddress()

      setAddress(walletAddress)
      log(`Connected: ${walletAddress}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!message.includes("User rejected") && !message.includes("dismissed")) {
        setError(`Connection failed: ${message}`)
        log(`ERROR: ${message}`)
      } else {
        log("Connection cancelled by user")
      }
    } finally {
      setIsConnecting(false)
    }
  }, [chainId, log])

  // =========================================================================
  // Disconnect handler
  // =========================================================================
  const disconnectWallet = useCallback(async () => {
    if (wcProviderRef.current) {
      await wcProviderRef.current.disconnect()
      wcProviderRef.current = null
    }
    setAddress("")
    setWcUri("")
    log("Wallet disconnected")
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
                <Globe className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                WalletConnect v2
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-accent">WalletConnect</span> Integration
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Connect any mobile wallet via QR code using{" "}
              <code className="text-zinc-300 font-mono text-sm bg-zinc-800/50 px-1.5 py-0.5 rounded">
                @walletconnect/ethereum-provider
              </code>{" "}
              and wrap the provider with{" "}
              <code className="text-zinc-300 font-mono text-sm bg-zinc-800/50 px-1.5 py-0.5 rounded">
                Eip1193SignerAdapter
              </code>.
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
                  SDK initialization is identical for all wallet types.
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
                  {address ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Connect via WalletConnect
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Create an EthereumProvider with your project ID, then wrap it
                  with{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    Eip1193SignerAdapter
                  </code>{" "}
                  — the same adapter used for MetaMask.
                </p>
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`// 1. Create WalletConnect provider`}
                  <br />
                  {`const provider = await EthereumProvider.init({`}
                  <br />
                  {`  projectId: 'YOUR_PROJECT_ID',`}
                  <br />
                  {`  chains: [1],`}
                  <br />
                  {`  showQrModal: true,`}
                  <br />
                  {`});`}
                  <br />
                  <br />
                  {`// 2. Enable (triggers QR modal)`}
                  <br />
                  {`await provider.enable();`}
                  <br />
                  <br />
                  {`// 3. Wrap with Eip1193SignerAdapter (same as MetaMask!)`}
                  <br />
                  {`const signer = new Eip1193SignerAdapter(provider);`}
                </div>

                {address ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-[#00ff9d]" />
                      <span className="text-zinc-300">
                        {truncateAddress(address)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div>
                    {!WC_PROJECT_ID && (
                      <p className="text-xs text-amber-400/80 mb-3">
                        Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local
                      </p>
                    )}
                    <Button
                      variant="accent"
                      size="lg"
                      onClick={connectWallet}
                      disabled={!sdk || isConnecting || !WC_PROJECT_ID}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Waiting for scan...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4" />
                          Connect WalletConnect
                        </>
                      )}
                    </Button>
                  </div>
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

                  {/* Create Secret — write, sends tx via WalletConnect provider */}
                  {address && wcProviderRef.current && (
                    <CreateSecret
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      provider={wcProviderRef.current}
                      log={log}
                    />
                  )}

                  {/* Set Delegate — write, sends tx via WalletConnect provider */}
                  {address && wcProviderRef.current && (
                    <SetDelegate
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      provider={wcProviderRef.current}
                      log={log}
                    />
                  )}

                  {/* Remove Delegation — write, sends tx via WalletConnect */}
                  {address && wcProviderRef.current && (
                    <RemoveDelegation
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      provider={wcProviderRef.current}
                      log={log}
                    />
                  )}

                  {/* Transfer Secret — write, sends tx via WalletConnect */}
                  {address && wcProviderRef.current && (
                    <TransferSecret
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      provider={wcProviderRef.current}
                      log={log}
                    />
                  )}

                  {/* Encrypt Payload — blackbox API, needs signer */}
                  {address && wcProviderRef.current && (
                    <EncryptPayload
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      provider={wcProviderRef.current}
                      log={log}
                    />
                  )}

                  {/* Decrypt Payload — blackbox API, needs signer */}
                  {address && wcProviderRef.current && (
                    <DecryptPayload
                      sdk={sdk}
                      chainId={chainId}
                      address={address}
                      provider={wcProviderRef.current}
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
