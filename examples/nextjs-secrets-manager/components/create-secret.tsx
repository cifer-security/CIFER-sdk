"use client"

/**
 * CreateSecret Component
 *
 * Demonstrates two approaches to creating a CIFER secret:
 *
 * 1. LOW-LEVEL (Manual):
 *    - Step 1: getSecretCreationFee() → reads the on-chain fee
 *    - Step 2: buildCreateSecretTx() → builds a TxIntent
 *    - Step 3: Execute the TxIntent via Thirdweb
 *    - Step 4: extractSecretIdFromReceipt() → parse the secret ID from logs
 *    - Step 5: Manually poll isSecretReady() until syncing completes
 *
 * 2. HIGH-LEVEL (Flow):
 *    - Single call to flows.createSecretAndWaitReady()
 *    - Handles fee reading, tx submission, receipt parsing, and polling
 *    - Reports step-by-step progress via onStepProgress callback
 *
 * Both approaches result in the same outcome: a new secret that is
 * ready for encryption/decryption.
 */

import { useState, useCallback } from "react"
import type { CiferSdk } from "cifer-sdk"
import type { Account } from "thirdweb/wallets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { thirdwebClient } from "@/lib/thirdweb-client"
import { createThirdwebSigner } from "@/lib/thirdweb-signer"
import { executeTxIntent, createTxExecutor } from "@/lib/tx-executor"
import { formatWei } from "@/lib/utils"
import { Plus, Zap, Wrench, Loader2, CheckCircle, XCircle } from "lucide-react"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface CreateSecretProps {
  sdk: CiferSdk
  account: Account
  chainId: number
  /** Callback after a secret is successfully created */
  onSecretCreated: () => void
}

type FlowStepStatus = "pending" | "in_progress" | "completed" | "failed"

interface FlowStepDisplay {
  id: string
  description: string
  status: FlowStepStatus
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function CreateSecret({
  sdk,
  account,
  chainId,
  onSecretCreated,
}: CreateSecretProps) {
  // Shared state
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdSecretId, setCreatedSecretId] = useState<bigint | null>(null)

  // Low-level specific state
  const [fee, setFee] = useState<bigint | null>(null)
  const [isFetchingFee, setIsFetchingFee] = useState(false)

  // Flow specific state
  const [flowSteps, setFlowSteps] = useState<FlowStepDisplay[]>([])
  const [flowLogs, setFlowLogs] = useState<string[]>([])

  // Get the controller address for the selected chain
  const controllerAddress = sdk.getControllerAddress(chainId)

  // ==================================================================
  // LOW-LEVEL APPROACH: Manual step-by-step secret creation
  // ==================================================================

  /**
   * Step 1: Read the secret creation fee from the SecretsController contract.
   *
   * Uses keyManagement.getSecretCreationFee() which calls the contract's
   * secretCreationFee() view function.
   */
  const handleFetchFee = useCallback(async () => {
    setIsFetchingFee(true)
    setError(null)

    try {
      // keyManagement.getSecretCreationFee() reads the fee from the contract
      const creationFee = await sdk.keyManagement.getSecretCreationFee({
        chainId,
        controllerAddress,
        readClient: sdk.readClient,
      })

      setFee(creationFee)
      console.log("[CreateSecret] Fee:", creationFee.toString(), "wei")
    } catch (err) {
      console.error("[CreateSecret] Failed to fetch fee:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch fee")
    } finally {
      setIsFetchingFee(false)
    }
  }, [sdk, chainId, controllerAddress])

  /**
   * Step 2-5: Build the transaction, execute it, extract secret ID, and poll.
   *
   * This demonstrates the low-level approach where you control each step:
   * - buildCreateSecretTx() → builds calldata for createSecret()
   * - executeTxIntent() → sends the transaction via Thirdweb
   * - extractSecretIdFromReceipt() → parses SecretCreated event from logs
   * - isSecretReady() → polls until syncing completes
   */
  const handleCreateManual = useCallback(async () => {
    if (fee === null) return

    setIsCreating(true)
    setError(null)
    setCreatedSecretId(null)

    try {
      // Step 2: Build the createSecret transaction intent
      // This returns a TxIntent with { to, data, value, chainId }
      const txIntent = sdk.keyManagement.buildCreateSecretTx({
        chainId,
        controllerAddress,
        fee,
      })
      console.log("[CreateSecret] TxIntent built:", txIntent.description)

      // Step 3: Execute the transaction using Thirdweb
      const receipt = await executeTxIntent(account, txIntent, thirdwebClient)
      console.log("[CreateSecret] Tx mined:", receipt.transactionHash)

      // Step 4: Extract the new secret ID from the transaction receipt
      // The SecretCreated event contains the auto-incremented secret ID
      const secretId = sdk.keyManagement.extractSecretIdFromReceipt(
        receipt.logs.map((log) => ({
          address: log.address as `0x${string}`,
          topics: [...log.topics] as `0x${string}`[],
          data: log.data as `0x${string}`,
          blockNumber: Number(log.blockNumber),
          transactionHash: log.transactionHash as `0x${string}`,
          logIndex: log.logIndex,
          transactionIndex: log.transactionIndex,
        }))
      )
      console.log("[CreateSecret] New secret ID:", secretId.toString())

      // Step 5: Poll until the secret is ready (isSyncing becomes false)
      // The enclave cluster generates ML-KEM-768 keys (~30-60 seconds)
      let ready = false
      let attempts = 0
      const maxAttempts = 60

      while (!ready && attempts < maxAttempts) {
        ready = await sdk.keyManagement.isSecretReady(
          { chainId, controllerAddress, readClient: sdk.readClient },
          secretId
        )

        if (!ready) {
          attempts++
          console.log(
            `[CreateSecret] Waiting for sync... (${attempts}/${maxAttempts})`
          )
          await new Promise((r) => setTimeout(r, 2000))
        }
      }

      if (!ready) {
        throw new Error("Secret sync timed out. Try refreshing to check status.")
      }

      setCreatedSecretId(secretId)
      console.log("[CreateSecret] Secret is ready!")
      onSecretCreated()
    } catch (err) {
      console.error("[CreateSecret] Manual creation failed:", err)
      setError(err instanceof Error ? err.message : "Failed to create secret")
    } finally {
      setIsCreating(false)
    }
  }, [sdk, account, chainId, controllerAddress, fee, onSecretCreated])

  // ==================================================================
  // HIGH-LEVEL APPROACH: flows.createSecretAndWaitReady()
  // ==================================================================

  /**
   * Create a secret using the high-level flow.
   *
   * flows.createSecretAndWaitReady() orchestrates the entire process:
   * 1. Reads the creation fee
   * 2. Builds and executes the createSecret transaction
   * 3. Extracts the secret ID from the receipt
   * 4. Polls until isSyncing becomes false
   *
   * We provide:
   * - signer: For blackbox authentication (via createThirdwebSigner)
   * - txExecutor: For sending transactions (via createTxExecutor)
   * - onStepProgress: Callback to track progress in the UI
   */
  const handleCreateFlow = useCallback(async () => {
    setIsCreating(true)
    setError(null)
    setCreatedSecretId(null)
    setFlowSteps([])
    setFlowLogs([])

    try {
      // Create the SDK signer from the Thirdweb account
      const signer = createThirdwebSigner(account)

      // Create the transaction executor for the flow
      const txExecutor = createTxExecutor(account, thirdwebClient)

      // Execute the flow with progress tracking
      const result = await sdk.flows.createSecretAndWaitReady(
        {
          signer,
          readClient: sdk.readClient,
          blackboxUrl: sdk.blackboxUrl,
          chainId,
          controllerAddress,
          txExecutor,
          // Logger receives progress messages
          logger: (msg) => {
            console.log(`[Flow] ${msg}`)
            setFlowLogs((prev) => [...prev, msg])
          },
        },
        {
          mode: "execute",
          // onStepProgress receives step updates for the UI
          onStepProgress: (step) => {
            setFlowSteps((prev) => {
              const existing = prev.find((s) => s.id === step.id)
              if (existing) {
                return prev.map((s) =>
                  s.id === step.id
                    ? {
                        ...s,
                        status: step.status as FlowStepStatus,
                      }
                    : s
                )
              }
              return [
                ...prev,
                {
                  id: step.id,
                  description: step.description,
                  status: step.status as FlowStepStatus,
                },
              ]
            })
          },
        }
      )

      if (result.success && result.data) {
        setCreatedSecretId(result.data.secretId)
        console.log(
          "[CreateSecret] Flow complete! Secret ID:",
          result.data.secretId.toString()
        )
        onSecretCreated()
      } else {
        throw result.error || new Error("Flow failed")
      }
    } catch (err) {
      console.error("[CreateSecret] Flow creation failed:", err)
      setError(err instanceof Error ? err.message : "Failed to create secret")
    } finally {
      setIsCreating(false)
    }
  }, [sdk, account, chainId, controllerAddress, onSecretCreated])

  // ==================================================================
  // Render
  // ==================================================================

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {createdSecretId !== null && (
        <div className="flex items-center gap-3 p-4 bg-[#00ff9d]/10 border border-[#00ff9d]/30 rounded-lg">
          <CheckCircle className="h-5 w-5 text-[#00ff9d] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Secret Created!</p>
            <p className="text-xs text-zinc-400">
              Secret ID:{" "}
              <code className="text-[#00ff9d] bg-zinc-900 px-1.5 py-0.5 rounded">
                {createdSecretId.toString()}
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
          <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* ============================================================
            LOW-LEVEL APPROACH
            ============================================================ */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <CardTitle className="text-white text-base">
                  Manual (Low-Level)
                </CardTitle>
                <CardDescription>
                  Step-by-step using keyManagement functions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Fetch Fee */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-mono">
                Step 1: getSecretCreationFee()
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchFee}
                  disabled={isFetchingFee || isCreating}
                >
                  {isFetchingFee ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Fetch Fee"
                  )}
                </Button>
                {fee !== null && (
                  <span className="text-xs text-[#00ff9d] font-mono">
                    {formatWei(fee)} native token
                  </span>
                )}
              </div>
            </div>

            {/* Step 2-5: Create Secret */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-mono">
                Step 2: buildCreateSecretTx() → execute → extract ID → poll
              </p>
              <Button
                variant="accent"
                size="sm"
                onClick={handleCreateManual}
                disabled={fee === null || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    Create Secret (Manual)
                  </>
                )}
              </Button>
            </div>

            {/* Code hint */}
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                {`// Low-level steps:`}
                <br />
                {`const fee = await keyManagement.getSecretCreationFee({...})`}
                <br />
                {`const txIntent = keyManagement.buildCreateSecretTx({...})`}
                <br />
                {`const receipt = await sendTransaction(txIntent)`}
                <br />
                {`const id = keyManagement.extractSecretIdFromReceipt(logs)`}
                <br />
                {`while (!await keyManagement.isSecretReady({...}, id)) wait()`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================
            FLOW APPROACH
            ============================================================ */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#00ff9d]" />
              </div>
              <div>
                <CardTitle className="text-white text-base">
                  Auto (Flow)
                </CardTitle>
                <CardDescription>
                  One-call using createSecretAndWaitReady
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Button */}
            <Button
              variant="accent"
              size="sm"
              onClick={handleCreateFlow}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Running Flow...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  Create Secret (Auto)
                </>
              )}
            </Button>

            {/* Flow Step Progress */}
            {flowSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">Flow Progress:</p>
                {flowSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    {step.status === "completed" && (
                      <CheckCircle className="h-3 w-3 text-[#00ff9d]" />
                    )}
                    {step.status === "in_progress" && (
                      <Loader2 className="h-3 w-3 text-[#00ff9d] animate-spin" />
                    )}
                    {step.status === "failed" && (
                      <XCircle className="h-3 w-3 text-red-400" />
                    )}
                    {step.status === "pending" && (
                      <div className="h-3 w-3 rounded-full border border-zinc-600" />
                    )}
                    <span
                      className={
                        step.status === "completed"
                          ? "text-zinc-300"
                          : step.status === "in_progress"
                            ? "text-white"
                            : "text-zinc-500"
                      }
                    >
                      {step.description}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Flow Logs */}
            {flowLogs.length > 0 && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 max-h-32 overflow-y-auto">
                {flowLogs.map((log, i) => (
                  <p key={i} className="text-[10px] text-zinc-500 font-mono">
                    {log}
                  </p>
                ))}
              </div>
            )}

            {/* Code hint */}
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                {`// High-level flow — handles everything:`}
                <br />
                {`const result = await flows.createSecretAndWaitReady({`}
                <br />
                {`  signer, readClient, blackboxUrl, chainId,`}
                <br />
                {`  controllerAddress, txExecutor, logger,`}
                <br />
                {`})`}
                <br />
                {`console.log(result.data.secretId)`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
