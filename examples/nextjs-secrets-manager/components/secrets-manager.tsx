"use client"

/**
 * SecretsManager Component
 *
 * The main dashboard shown after wallet connection.
 * Ties together all the pieces:
 *
 * 1. Header with wallet info + disconnect button
 * 2. Chain selector (getSupportedChainIds)
 * 3. Create Secret section (manual + flow)
 * 4. Secrets List (owned + delegated with details)
 *
 * This is the top-level component that manages:
 * - Selected chain state
 * - Refresh triggers when secrets are created/modified
 * - Layout of all sub-components
 */

import { useState, useMemo } from "react"
import type { CiferSdk } from "cifer-sdk"
import type { Account } from "thirdweb/wallets"
import { useDisconnect, useActiveWallet } from "thirdweb/react"
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient, wallets } from "@/lib/thirdweb-client"
import { Container } from "@/components/ui/container"
import { ChainSelector } from "@/components/chain-selector"
import { CreateSecret } from "@/components/create-secret"
import { SecretsList } from "@/components/secrets-list"
import { truncateAddress } from "@/lib/utils"
import { LogOut, Key, Layers } from "lucide-react"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface SecretsManagerProps {
  account: Account
  sdk: CiferSdk
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function SecretsManager({ account, sdk }: SecretsManagerProps) {
  // Get supported chain IDs from the SDK (populated during discovery)
  const supportedChainIds = useMemo(
    () => sdk.getSupportedChainIds(),
    [sdk]
  )

  // Selected chain — default to first supported chain
  const [selectedChainId, setSelectedChainId] = useState<number>(
    supportedChainIds[0] ?? 0
  )

  // Refresh trigger — increment to force SecretsList to refetch
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Wallet disconnect hook
  const { disconnect } = useDisconnect()
  const wallet = useActiveWallet()

  /**
   * Called when a secret is created (manual or flow).
   * Increments the trigger to refresh the secrets list.
   */
  const handleSecretCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-black page-bg">
      {/* ============================================================
          HEADER
          ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl">
        <Container>
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <span
              className="text-lg sm:text-xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-logo)" }}
            >
              CIFER{" "}
              <span className="text-[#00ff9d]">Secrets Manager</span>
            </span>

            {/* Right side: wallet info + disconnect */}
            <div className="flex items-center gap-3">
              {/* Connected wallet address badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff9d]" />
                {truncateAddress(account.address)}
              </span>

              {/* Thirdweb ConnectButton in connected state shows account management */}
              <ConnectButton
                client={thirdwebClient}
                wallets={wallets}
                connectButton={{
                  style: {
                    backgroundColor: "transparent",
                    color: "#a1a1aa",
                    fontSize: "13px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272a",
                  },
                }}
                theme="dark"
              />
            </div>
          </div>
        </Container>
      </header>

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      <main className="pb-24">
        <Container className="py-8 space-y-8">
          {/* Page Title + Chain Selector */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#00ff9d]" />
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Secrets Dashboard
                </h1>
              </div>
              <p className="text-sm text-zinc-500">
                Manage your quantum-resistant encryption secrets across chains.
              </p>
            </div>

            {/* Chain Selector */}
            <div className="w-full sm:w-64">
              <ChainSelector
                chainIds={supportedChainIds}
                selectedChainId={selectedChainId}
                onChainChange={setSelectedChainId}
              />
            </div>
          </div>

          {/* SDK Info Banner */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">Supported Chains:</span>
              <span className="text-xs text-zinc-300 font-mono">
                {supportedChainIds.length}
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Active Chain:</span>
              <span className="text-xs text-[#00ff9d] font-mono">
                {selectedChainId}
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Controller:</span>
              <span className="text-xs text-zinc-400 font-mono truncate max-w-[200px]">
                {truncateAddress(sdk.getControllerAddress(selectedChainId), 6)}
              </span>
            </div>
          </div>

          {/* ============================================================
              CREATE SECRET SECTION
              ============================================================ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                Create Secret
              </h2>
              <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">
                Chain {selectedChainId}
              </span>
            </div>
            <CreateSecret
              sdk={sdk}
              account={account}
              chainId={selectedChainId}
              onSecretCreated={handleSecretCreated}
            />
          </section>

          {/* ============================================================
              SECRETS LIST SECTION
              ============================================================ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                Your Secrets
              </h2>
              <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">
                Chain {selectedChainId}
              </span>
            </div>
            <SecretsList
              sdk={sdk}
              account={account}
              chainId={selectedChainId}
              refreshTrigger={refreshTrigger}
            />
          </section>

          {/* ============================================================
              SDK REFERENCE FOOTER
              ============================================================ */}
          <section className="mt-12 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">
              SDK Functions Demonstrated
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Read Functions */}
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 font-medium">
                  Read Functions (keyManagement)
                </p>
                <ul className="space-y-1 text-xs text-zinc-600 font-mono">
                  <li>• getSecretCreationFee()</li>
                  <li>• getSecret()</li>
                  <li>• getSecretOwner()</li>
                  <li>• getDelegate()</li>
                  <li>• getSecretsByWallet()</li>
                  <li>• getSecretsCountByWallet()</li>
                  <li>• isSecretReady()</li>
                  <li>• isAuthorized()</li>
                </ul>
              </div>
              {/* Write Functions */}
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 font-medium">
                  Transaction Builders + Flows
                </p>
                <ul className="space-y-1 text-xs text-zinc-600 font-mono">
                  <li>• buildCreateSecretTx()</li>
                  <li>• buildSetDelegateTx()</li>
                  <li>• buildRemoveDelegationTx()</li>
                  <li>• buildTransferSecretTx()</li>
                  <li>• extractSecretIdFromReceipt()</li>
                  <li className="text-[#00ff9d]/50">
                    • flows.createSecretAndWaitReady()
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </div>
  )
}
