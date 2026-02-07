/**
 * Create Secret — Thirdweb
 * =========================
 *
 * This component demonstrates the full secret creation flow with the CIFER SDK:
 *   1. Read the creation fee via keyManagement.getSecretCreationFee()
 *   2. Build a transaction intent via keyManagement.buildCreateSecretTx()
 *   3. Send the transaction using Thirdweb's prepareTransaction + sendTransaction
 *   4. Wait for the transaction receipt via waitForReceipt
 *   5. Extract the secret ID via keyManagement.extractSecretIdFromReceipt()
 *   6. Poll keyManagement.isSecretReady() until the secret is synced
 *
 * Creating a secret requires sending native token (the creation fee) to the
 * SecretsController contract. After the transaction is confirmed, the enclave
 * cluster generates ML-KEM-768 keys which takes ~30-60 seconds.
 *
 * ⚠️  IMPORTANT — Thirdweb Client & Custom Chains
 * =================================================
 * The `thirdwebClient` and `getThirdwebChain()` helper are passed in as
 * props from page.tsx — this keeps chain configuration centralized.
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
// Thirdweb imports — used to send the transaction
// ---------------------------------------------------------------------------
import {
  prepareTransaction,
  sendTransaction,
  waitForReceipt,
  type ThirdwebClient,
} from "thirdweb"
import type { Account } from "thirdweb/wallets"
import type { Chain } from "thirdweb/chains"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { keyManagement, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreateSecretProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The Thirdweb Account (from useActiveAccount) — used to send the tx */
  account: Account
  /** The shared Thirdweb client (created in page.tsx) */
  thirdwebClient: ThirdwebClient
  /**
   * Resolves a chainId to the correct Thirdweb Chain definition.
   * This is defined in page.tsx and handles custom chains like Ternoa
   * that are not in Thirdweb's built-in registry.
   */
  getThirdwebChain: (chainId: number) => Chain
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function CreateSecret({
  sdk,
  chainId,
  account,
  thirdwebClient,
  getThirdwebChain,
  log,
}: CreateSecretProps) {
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
  // 3. prepareTransaction + sendTransaction → Thirdweb sends the tx
  // 4. waitForReceipt          → wait for on-chain confirmation
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

      // Step 3: Send via Thirdweb
      setStatus("Confirm in wallet...")
      log("Sending transaction via Thirdweb...")

      const chain = getThirdwebChain(chainId)
      const tx = prepareTransaction({
        to: txIntent.to as `0x${string}`,
        data: txIntent.data as `0x${string}`,
        value: txIntent.value ?? BigInt(0),
        chain,
        client: thirdwebClient,
      })

      const result = await sendTransaction({ transaction: tx, account })
      setTxHash(result.transactionHash)
      log(`Transaction sent! Hash: ${result.transactionHash}`)

      // Step 4: Wait for receipt
      setStatus("Waiting for confirmation...")
      log("Waiting for transaction confirmation...")

      const receipt = await waitForReceipt({
        transactionHash: result.transactionHash,
        chain,
        client: thirdwebClient,
      })

      if (receipt.status !== "success") {
        throw new Error("Transaction failed (reverted)")
      }

      log(`Transaction confirmed! Status: ${receipt.status}`)

      // Step 5: Extract secret ID from receipt logs
      setStatus("Extracting secret ID...")

      const logs = receipt.logs.map((l) => ({
        address: l.address as `0x${string}`,
        topics: [...l.topics] as `0x${string}`[],
        data: l.data as `0x${string}`,
        blockNumber: Number(l.blockNumber),
        transactionHash: l.transactionHash as `0x${string}`,
        logIndex: l.logIndex,
        transactionIndex: l.transactionIndex,
      }))

      const newSecretId = keyManagement.extractSecretIdFromReceipt(logs)
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
  }, [sdk, chainId, account, thirdwebClient, getThirdwebChain, log])

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
        Thirdweb, then waits for the enclave to generate keys.
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
        {`// 3. Send via Thirdweb`}
        <br />
        {`const chain = getThirdwebChain(chainId);`}
        <br />
        {`const tx = prepareTransaction({`}
        <br />
        {`  to: txIntent.to, data: txIntent.data,`}
        <br />
        {`  value: txIntent.value, chain, client,`}
        <br />
        {`});`}
        <br />
        {`const result = await sendTransaction({ transaction: tx, account });`}
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
