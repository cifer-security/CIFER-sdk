/**
 * Create Secret — WalletConnect
 * ===============================
 *
 * This component demonstrates the full secret creation flow with the CIFER SDK:
 *   1. Read the creation fee via keyManagement.getSecretCreationFee()
 *   2. Build a transaction intent via keyManagement.buildCreateSecretTx()
 *   3. Send the transaction using the WalletConnect EIP-1193 provider
 *   4. Wait for the transaction receipt
 *   5. Extract the secret ID via keyManagement.extractSecretIdFromReceipt()
 *   6. Poll keyManagement.isSecretReady() until the secret is synced
 *
 * Creating a secret requires sending native token (the creation fee) to the
 * SecretsController contract. After the transaction is confirmed, the enclave
 * cluster generates ML-KEM-768 keys which takes ~30-60 seconds.
 *
 * This works identically to the MetaMask version — both use EIP-1193 providers.
 * The only difference is the provider was created via QR code pairing instead
 * of a browser extension.
 *
 * SDK functions used:
 *   keyManagement.getSecretCreationFee({ chainId, controllerAddress, readClient })
 *   keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee })
 *   keyManagement.extractSecretIdFromReceipt(logs)
 *   keyManagement.isSecretReady({ chainId, controllerAddress, readClient }, secretId)
 */

"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatWei } from "@/lib/utils"
import { getChainCurrency } from "@/lib/chains"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { keyManagement, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// WalletConnect provider type
// ---------------------------------------------------------------------------
import type EthereumProvider from "@walletconnect/ethereum-provider"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreateSecretProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The connected wallet address (used as `from` in the tx) */
  address: string
  /** The WalletConnect EIP-1193 provider — used to send the tx */
  provider: InstanceType<typeof EthereumProvider>
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Helper: Poll for transaction receipt via EIP-1193 provider
//
// eth_sendTransaction only returns the tx hash — we need to poll
// eth_getTransactionReceipt to know when the tx is mined and get the logs.
// ===========================================================================

interface TxReceipt {
  status: string
  logs: Array<{
    address: string
    topics: string[]
    data: string
    blockNumber: string
    transactionHash: string
    logIndex: string
    transactionIndex: string
  }>
}

async function waitForReceipt(
  provider: InstanceType<typeof EthereumProvider>,
  txHash: string,
  maxAttempts = 60,
): Promise<TxReceipt> {
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    }) as TxReceipt | null

    if (receipt) return receipt
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error("Timed out waiting for transaction receipt")
}

// ===========================================================================
// Component
// ===========================================================================

export function CreateSecret({ sdk, chainId, address, provider, log }: CreateSecretProps) {
  // ---- Local state ----
  const [isCreating, setIsCreating] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [secretId, setSecretId] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  // =========================================================================
  // Full create-secret flow:
  //
  // 1. getSecretCreationFee()  → reads the on-chain fee
  // 2. buildCreateSecretTx()   → builds a TxIntent with { to, data, value }
  // 3. eth_sendTransaction     → WalletConnect sends the tx (user approves in mobile wallet)
  // 4. eth_getTransactionReceipt → poll until mined
  // 5. extractSecretIdFromReceipt() → parse SecretCreated event from logs
  // 6. isSecretReady()         → poll until enclave keys are generated
  // =========================================================================
  const handleCreateSecret = useCallback(async () => {
    try {
      setIsCreating(true)
      setError("")
      setTxHash("")
      setSecretId("")

      const controllerAddress = sdk.getControllerAddress(chainId)

      // Step 1: Read the creation fee
      setStatus("Reading creation fee...")
      log("Reading secret creation fee...")

      const fee = await keyManagement.getSecretCreationFee({
        chainId,
        controllerAddress,
        readClient: sdk.readClient,
      })

      const currency = getChainCurrency(chainId)
      log(`Fee: ${formatWei(fee)} ${currency} (${fee} wei)`)

      // Step 2: Build the transaction intent
      setStatus("Building transaction...")
      log("Building createSecret transaction...")

      const txIntent = keyManagement.buildCreateSecretTx({
        chainId,
        controllerAddress,
        fee,
      })

      log(`TxIntent built: ${txIntent.description}`)
      log(`  to: ${txIntent.to}`)
      log(`  value: ${txIntent.value} wei`)

      // Step 3: Send via WalletConnect (EIP-1193 — same as MetaMask!)
      setStatus("Approve in mobile wallet...")
      log("Sending transaction via WalletConnect (approve in your mobile wallet)...")

      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: txIntent.to,
            data: txIntent.data,
            value: `0x${txIntent.value!.toString(16)}`,
          },
        ],
      }) as string

      setTxHash(hash)
      log(`Transaction sent! Hash: ${hash}`)

      // Step 4: Wait for receipt
      setStatus("Waiting for confirmation...")
      log("Waiting for transaction receipt...")

      const receipt = await waitForReceipt(provider, hash)

      if (receipt.status !== "0x1") {
        throw new Error("Transaction failed (reverted)")
      }

      log("Transaction confirmed!")

      // Step 5: Extract secret ID from receipt logs
      setStatus("Extracting secret ID...")

      const parsedLogs = receipt.logs.map((l) => ({
        address: l.address as `0x${string}`,
        topics: l.topics as `0x${string}`[],
        data: l.data as `0x${string}`,
        blockNumber: parseInt(l.blockNumber, 16),
        transactionHash: l.transactionHash as `0x${string}`,
        logIndex: parseInt(l.logIndex, 16),
        transactionIndex: parseInt(l.transactionIndex, 16),
      }))

      const newSecretId = keyManagement.extractSecretIdFromReceipt(parsedLogs)
      log(`Secret created with ID: ${newSecretId}`)

      // Step 6: Poll until the secret is ready (enclave generates keys)
      setStatus("Waiting for secret to sync...")
      log("Waiting for enclave to generate keys (this may take ~30-60s)...")

      let isReady = false
      for (let i = 0; i < 60; i++) {
        isReady = await keyManagement.isSecretReady(
          { chainId, controllerAddress, readClient: sdk.readClient },
          newSecretId,
        )
        if (isReady) break
        log(`Waiting for sync... (${i + 1}/60)`)
        await new Promise((r) => setTimeout(r, 2000))
      }

      if (!isReady) {
        throw new Error("Secret sync timed out. Try refreshing to check status.")
      }

      setSecretId(newSecretId.toString())
      setStatus("")
      log(`Secret #${newSecretId} is ready!`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setStatus("")
      log(`ERROR: ${message}`)
    } finally {
      setIsCreating(false)
    }
  }, [sdk, chainId, address, provider, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          buildCreateSecretTx
        </span>
        {secretId ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Create Secret
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Create a new CIFER secret. Reads the fee, sends the transaction via
        WalletConnect, then waits for the enclave to generate keys.
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`// 1. Read the fee`}
        <br />
        {`const fee = await keyManagement.getSecretCreationFee({...});`}
        <br />
        <br />
        {`// 2. Build the TxIntent`}
        <br />
        {`const txIntent = keyManagement.buildCreateSecretTx({`}
        <br />
        {`  chainId, controllerAddress, fee,`}
        <br />
        {`});`}
        <br />
        <br />
        {`// 3. Send via WalletConnect (same EIP-1193 as MetaMask!)`}
        <br />
        {`const hash = await provider.request({`}
        <br />
        {`  method: 'eth_sendTransaction',`}
        <br />
        {`  params: [{ from, to: txIntent.to, data: txIntent.data,`}
        <br />
        {`           value: txIntent.value }],`}
        <br />
        {`});`}
        <br />
        <br />
        {`// 4. Extract secret ID from receipt`}
        <br />
        {`const id = keyManagement.extractSecretIdFromReceipt(receipt.logs);`}
        <br />
        <br />
        {`// 5. Wait for sync`}
        <br />
        {`while (!await keyManagement.isSecretReady({...}, id)) wait();`}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {/* Status */}
      {status && (
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
          <Loader2 className="h-3 w-3 animate-spin" />
          {status}
        </div>
      )}

      {/* Tx hash */}
      {txHash && !secretId && (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
          <p className="text-xs text-zinc-500 mb-1">Transaction Hash</p>
          <p className="text-xs font-mono text-zinc-300 break-all">
            {txHash}
          </p>
        </div>
      )}

      {/* Result */}
      {secretId ? (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
          <p className="text-xs text-zinc-500 mb-1">Secret Created</p>
          <p className="text-2xl font-bold text-white">
            #{secretId}
          </p>
          {txHash && (
            <p className="text-xs font-mono text-zinc-600 mt-1 break-all">
              tx: {txHash}
            </p>
          )}
        </div>
      ) : null}

      {/* Create button */}
      <Button
        variant="accent"
        onClick={handleCreateSecret}
        disabled={isCreating}
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create Secret
          </>
        )}
      </Button>
    </div>
  )
}
