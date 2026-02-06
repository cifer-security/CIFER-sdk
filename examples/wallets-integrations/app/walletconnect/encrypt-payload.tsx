/**
 * Encrypt Payload — WalletConnect
 * =================================
 *
 * This component demonstrates blackbox.payload.encryptPayload() —
 * encrypting a short plaintext message using a CIFER secret's public key.
 *
 * The signer is needed for authentication (the Blackbox verifies that the
 * caller is the secret's owner or delegate before encrypting).
 *
 * For WalletConnect, we create the signer with:
 *   new Eip1193SignerAdapter(provider)
 * This is the same adapter used for MetaMask — WalletConnect's
 * EthereumProvider implements the same EIP-1193 interface.
 *
 * SDK function used:
 *   blackbox.payload.encryptPayload({
 *     chainId, secretId, plaintext, signer, readClient, blackboxUrl
 *   })
 *
 * Returns:
 *   { cifer, encryptedMessage }
 */

"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { blackbox, Eip1193SignerAdapter, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// WalletConnect provider type
// ---------------------------------------------------------------------------
import type EthereumProvider from "@walletconnect/ethereum-provider"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EncryptPayloadProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The connected wallet address (for display) */
  address: string
  /** The WalletConnect EIP-1193 provider — used to create the signer */
  provider: InstanceType<typeof EthereumProvider>
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function EncryptPayload({ sdk, chainId, address, provider, log }: EncryptPayloadProps) {
  // ---- Local state ----
  const [secretId, setSecretId] = useState<string>("")
  const [plaintext, setPlaintext] = useState<string>("")
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [result, setResult] = useState<{ cifer: string; encryptedMessage: string } | null>(null)
  const [error, setError] = useState<string>("")

  // =========================================================================
  // Encrypt a plaintext message via the Blackbox API
  //
  // We create the signer from the WalletConnect provider using the same
  // Eip1193SignerAdapter that MetaMask uses.
  // =========================================================================
  const handleEncrypt = useCallback(async () => {
    if (!secretId || !plaintext) return

    try {
      setIsEncrypting(true)
      setError("")
      setResult(null)

      log(`Encrypting payload for secret #${secretId}...`)

      // Create a signer from the WalletConnect EIP-1193 provider
      const signer = new Eip1193SignerAdapter(provider as any)

      // Call the Blackbox encrypt API via the SDK
      const encrypted = await blackbox.payload.encryptPayload({
        chainId,
        secretId: BigInt(secretId),
        plaintext,
        signer,
        readClient: sdk.readClient,
        blackboxUrl: sdk.blackboxUrl,
      })

      setResult({
        cifer: encrypted.cifer,
        encryptedMessage: encrypted.encryptedMessage,
      })
      log(`Encryption successful!`)
      log(`  cifer: ${encrypted.cifer.slice(0, 40)}...`)
      log(`  encryptedMessage: ${encrypted.encryptedMessage.slice(0, 40)}...`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsEncrypting(false)
    }
  }, [sdk, chainId, provider, secretId, plaintext, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          blackbox.payload.encryptPayload
        </span>
        {result ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Encrypt Payload
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Encrypt a short message using a secret&apos;s public key via the Blackbox API.
        Requires authentication (owner or delegate).
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`// Same Eip1193SignerAdapter as MetaMask!`}
        <br />
        {`const signer = new Eip1193SignerAdapter(provider);`}
        <br />
        <br />
        {`const result = await blackbox.payload.encryptPayload({`}
        <br />
        {`  chainId, secretId, plaintext,`}
        <br />
        {`  signer, readClient: sdk.readClient,`}
        <br />
        {`  blackboxUrl: sdk.blackboxUrl,`}
        <br />
        {`});`}
        <br />
        {`// result.cifer, result.encryptedMessage`}
      </div>

      {/* Form inputs */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Secret ID
          </label>
          <input
            type="number"
            value={secretId}
            onChange={(e) => {
              setSecretId(e.target.value)
              setResult(null)
            }}
            placeholder="e.g. 123"
            className="
              w-full bg-zinc-900 border border-zinc-800 rounded-lg
              px-3 py-2 text-sm text-white placeholder-zinc-600
              focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
              transition-colors
            "
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Plaintext
          </label>
          <textarea
            value={plaintext}
            onChange={(e) => {
              setPlaintext(e.target.value)
              setResult(null)
            }}
            placeholder="Enter your secret message..."
            rows={3}
            className="
              w-full bg-zinc-900 border border-zinc-800 rounded-lg
              px-3 py-2 text-sm text-white placeholder-zinc-600
              focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
              transition-colors resize-none
            "
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {/* Results */}
      {result ? (
        <div className="space-y-3 mb-3">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-3">
            <div>
              <p className="text-xs text-zinc-500 mb-1">CIFER Envelope</p>
              <p className="text-xs font-mono text-white break-all max-h-20 overflow-auto">
                {result.cifer}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Encrypted Message</p>
              <p className="text-xs font-mono text-white break-all max-h-20 overflow-auto">
                {result.encryptedMessage}
              </p>
            </div>
          </div>

          {/* Encrypt again */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResult(null)}
          >
            Encrypt Another
          </Button>
        </div>
      ) : (
        <Button
          variant="accent"
          onClick={handleEncrypt}
          disabled={isEncrypting || !secretId || !plaintext}
        >
          {isEncrypting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Encrypting...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Encrypt
            </>
          )}
        </Button>
      )}
    </div>
  )
}
