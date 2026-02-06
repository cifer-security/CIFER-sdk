/**
 * Decrypt Payload — WalletConnect
 * =================================
 *
 * This component demonstrates blackbox.payload.decryptPayload() —
 * decrypting a message that was encrypted with encryptPayload().
 *
 * The signer must be the secret's owner or delegate — the Blackbox
 * verifies authentication before releasing the decrypted data.
 *
 * For WalletConnect, we create the signer with:
 *   new Eip1193SignerAdapter(provider)
 *
 * SDK function used:
 *   blackbox.payload.decryptPayload({
 *     chainId, secretId, encryptedMessage, cifer, signer, readClient, blackboxUrl
 *   })
 *
 * Returns:
 *   { decryptedMessage }
 */

"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Loader2, Unlock } from "lucide-react"
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

interface DecryptPayloadProps {
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

export function DecryptPayload({ sdk, chainId, address, provider, log }: DecryptPayloadProps) {
  // ---- Local state ----
  const [secretId, setSecretId] = useState<string>("")
  const [encryptedMessage, setEncryptedMessage] = useState<string>("")
  const [cifer, setCifer] = useState<string>("")
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decryptedMessage, setDecryptedMessage] = useState<string>("")
  const [error, setError] = useState<string>("")

  // =========================================================================
  // Decrypt an encrypted message via the Blackbox API
  // =========================================================================
  const handleDecrypt = useCallback(async () => {
    if (!secretId || !encryptedMessage || !cifer) return

    try {
      setIsDecrypting(true)
      setError("")
      setDecryptedMessage("")

      log(`Decrypting payload for secret #${secretId}...`)

      // Create a signer from the WalletConnect EIP-1193 provider
      const signer = new Eip1193SignerAdapter(provider as any)

      // Call the Blackbox decrypt API via the SDK
      const result = await blackbox.payload.decryptPayload({
        chainId,
        secretId: BigInt(secretId),
        encryptedMessage,
        cifer,
        signer,
        readClient: sdk.readClient,
        blackboxUrl: sdk.blackboxUrl,
      })

      setDecryptedMessage(result.decryptedMessage)
      log(`Decryption successful!`)
      log(`  decryptedMessage: ${result.decryptedMessage}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsDecrypting(false)
    }
  }, [sdk, chainId, provider, secretId, encryptedMessage, cifer, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          blackbox.payload.decryptPayload
        </span>
        {decryptedMessage ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Decrypt Payload
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Decrypt an encrypted message using the Blackbox API.
        Paste the cifer envelope and encrypted message from the encrypt step.
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`// Same Eip1193SignerAdapter as MetaMask!`}
        <br />
        {`const signer = new Eip1193SignerAdapter(provider);`}
        <br />
        <br />
        {`const result = await blackbox.payload.decryptPayload({`}
        <br />
        {`  chainId, secretId, encryptedMessage, cifer,`}
        <br />
        {`  signer, readClient: sdk.readClient,`}
        <br />
        {`  blackboxUrl: sdk.blackboxUrl,`}
        <br />
        {`});`}
        <br />
        {`// result.decryptedMessage`}
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
              setDecryptedMessage("")
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
            Encrypted Message
          </label>
          <textarea
            value={encryptedMessage}
            onChange={(e) => {
              setEncryptedMessage(e.target.value)
              setDecryptedMessage("")
            }}
            placeholder="Paste the encryptedMessage from encrypt result..."
            rows={3}
            className="
              w-full bg-zinc-900 border border-zinc-800 rounded-lg
              px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono
              focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
              transition-colors resize-none
            "
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            CIFER Envelope
          </label>
          <textarea
            value={cifer}
            onChange={(e) => {
              setCifer(e.target.value)
              setDecryptedMessage("")
            }}
            placeholder="Paste the cifer envelope from encrypt result..."
            rows={3}
            className="
              w-full bg-zinc-900 border border-zinc-800 rounded-lg
              px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono
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

      {/* Result */}
      {decryptedMessage ? (
        <div className="space-y-3 mb-3">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Decrypted Message</p>
            <p className="text-sm text-[#00ff9d] break-all">
              {decryptedMessage}
            </p>
          </div>

          {/* Decrypt again */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDecryptedMessage("")}
          >
            Decrypt Another
          </Button>
        </div>
      ) : (
        <Button
          variant="accent"
          onClick={handleDecrypt}
          disabled={isDecrypting || !secretId || !encryptedMessage || !cifer}
        >
          {isDecrypting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Decrypting...
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Decrypt
            </>
          )}
        </Button>
      )}
    </div>
  )
}
