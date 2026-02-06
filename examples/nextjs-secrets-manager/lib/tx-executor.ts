/**
 * Thirdweb → CIFER SDK Transaction Executor
 *
 * Bridges the CIFER SDK's TxIntent pattern to Thirdweb's transaction system.
 *
 * The CIFER SDK returns TxIntent objects (containing to, data, value, chainId)
 * instead of executing transactions directly. This module provides utilities
 * to execute those intents using a Thirdweb Account.
 *
 * Used in two contexts:
 * 1. Manual execution: User clicks a button, we send the TxIntent
 * 2. Flow execution: The SDK's flow system calls txExecutor automatically
 *
 * @example Manual execution
 * ```typescript
 * const txIntent = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });
 * const receipt = await executeTxIntent(account, txIntent, thirdwebClient);
 * ```
 *
 * @example Flow execution
 * ```typescript
 * const result = await flows.createSecretAndWaitReady({
 *   txExecutor: createTxExecutor(account, thirdwebClient),
 *   ...
 * });
 * ```
 */

import type { Account } from "thirdweb/wallets"
import type { ThirdwebClient } from "thirdweb"
import {
  prepareTransaction,
  sendTransaction,
  waitForReceipt,
} from "thirdweb"
import { defineChain } from "thirdweb/chains"

/**
 * TxIntent shape from the CIFER SDK.
 * Defined inline to match the SDK's TxIntent interface.
 */
interface TxIntent {
  chainId: number
  to: string
  data: string
  value?: bigint
}

/**
 * Execute a CIFER SDK TxIntent using a Thirdweb Account.
 *
 * Steps:
 * 1. Prepare a Thirdweb transaction from the TxIntent fields
 * 2. Send the transaction via the connected account
 * 3. Wait for the receipt and return it
 *
 * @param account - Thirdweb Account (from useActiveAccount)
 * @param intent - The TxIntent from the CIFER SDK
 * @param client - Thirdweb client instance
 * @returns The transaction receipt
 */
export async function executeTxIntent(
  account: Account,
  intent: TxIntent,
  client: ThirdwebClient
) {
  // Define the target chain for Thirdweb
  const chain = defineChain(intent.chainId)

  // Prepare the raw transaction from the SDK's TxIntent
  const tx = prepareTransaction({
    to: intent.to as `0x${string}`,
    data: intent.data as `0x${string}`,
    value: intent.value ?? 0n,
    chain,
    client,
  })

  // Send the transaction using the connected Thirdweb account
  const result = await sendTransaction({ transaction: tx, account })

  // Wait for the transaction to be mined and return the receipt
  const receipt = await waitForReceipt({
    transactionHash: result.transactionHash,
    chain,
    client,
  })

  return receipt
}

/**
 * Create a TxExecutor function compatible with the CIFER SDK flows.
 *
 * The SDK's flow system (e.g. createSecretAndWaitReady) expects a txExecutor
 * callback that takes a TxIntent and returns { hash, waitReceipt }.
 *
 * @param account - Thirdweb Account
 * @param client - Thirdweb client instance
 * @returns A txExecutor function for use in FlowContext
 */
export function createTxExecutor(account: Account, client: ThirdwebClient) {
  return async (intent: TxIntent) => {
    const chain = defineChain(intent.chainId)

    // Prepare and send the transaction
    const tx = prepareTransaction({
      to: intent.to as `0x${string}`,
      data: intent.data as `0x${string}`,
      value: intent.value ?? 0n,
      chain,
      client,
    })

    const result = await sendTransaction({ transaction: tx, account })

    return {
      hash: result.transactionHash as `0x${string}`,
      /**
       * Wait for the receipt and transform it to the format expected
       * by the CIFER SDK (status, logs, etc.)
       */
      waitReceipt: async () => {
        const receipt = await waitForReceipt({
          transactionHash: result.transactionHash,
          chain,
          client,
        })

        // Transform Thirdweb receipt to CIFER SDK TransactionReceipt format
        return {
          transactionHash: receipt.transactionHash as `0x${string}`,
          blockNumber: Number(receipt.blockNumber),
          status: receipt.status === "success" ? (1 as const) : (0 as const),
          gasUsed: receipt.gasUsed,
          logs: receipt.logs.map((log) => ({
            address: log.address as `0x${string}`,
            topics: [...log.topics] as `0x${string}`[],
            data: log.data as `0x${string}`,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash as `0x${string}`,
            logIndex: log.logIndex,
            transactionIndex: log.transactionIndex,
          })),
        }
      },
    }
  }
}
