/**
 * Shared EIP-1193 helpers for MetaMask / WalletConnect write flows.
 *
 * eth_sendTransaction always uses the wallet's *currently selected* chain.
 * Selecting Base in the UI alone is not enough — the provider must be
 * switched (and the chain added if missing) before broadcasting.
 */

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export interface EnsureWalletChainOptions {
  chainName: string
  currencySymbol: string
  rpcUrl: string
  /** Optional block explorer URL for wallet_addEthereumChain */
  blockExplorerUrl?: string
}

export interface TxReceipt {
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

function toHexChainId(chainId: number): `0x${string}` {
  return `0x${chainId.toString(16)}`
}

function getErrorCode(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined
  const withCode = err as {
    code?: number
    data?: { originalError?: { code?: number } }
  }
  return withCode.code ?? withCode.data?.originalError?.code
}

/**
 * Ensure the EIP-1193 provider is on `chainId` before sending a tx.
 *
 * Tries wallet_switchEthereumChain first. If the chain is unknown (4902),
 * adds it via wallet_addEthereumChain using discovery RPC metadata, then
 * switches again.
 */
export async function ensureWalletChain(
  provider: Eip1193Provider,
  chainId: number,
  options: EnsureWalletChainOptions,
): Promise<void> {
  const hexChainId = toHexChainId(chainId)

  const currentHex = (await provider.request({
    method: "eth_chainId",
  })) as string
  if (parseInt(currentHex, 16) === chainId) {
    return
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    })
  } catch (err) {
    const code = getErrorCode(err)
    // 4902 = unrecognized chain — add it, then switch
    if (code !== 4902) {
      throw err
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: hexChainId,
          chainName: options.chainName,
          nativeCurrency: {
            name: options.currencySymbol,
            symbol: options.currencySymbol,
            decimals: 18,
          },
          rpcUrls: [options.rpcUrl],
          ...(options.blockExplorerUrl
            ? { blockExplorerUrls: [options.blockExplorerUrl] }
            : {}),
        },
      ],
    })
  }

  const confirmedHex = (await provider.request({
    method: "eth_chainId",
  })) as string
  if (parseInt(confirmedHex, 16) !== chainId) {
    throw new Error(
      `Wallet is still on chain ${parseInt(confirmedHex, 16)}; expected ${chainId}. Switch networks in your wallet and retry.`,
    )
  }
}

/**
 * Poll eth_getTransactionReceipt until the tx is mined (or timeout).
 */
export async function waitForReceipt(
  provider: Eip1193Provider,
  txHash: string,
  maxAttempts = 60,
): Promise<TxReceipt> {
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = (await provider.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    })) as TxReceipt | null

    if (receipt) return receipt
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error("Timed out waiting for transaction receipt")
}
