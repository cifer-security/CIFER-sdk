"use client"

/**
 * CIFER SDK React Context
 *
 * Provides the initialized CIFER SDK instance to all components via React context.
 *
 * The SDK is initialized once using createCiferSdk() with automatic discovery.
 * Discovery fetches supported chains, RPC URLs, and contract addresses from
 * the Blackbox API's /healthz endpoint.
 *
 * Usage:
 * 1. Wrap your app with <CiferSdkProvider>
 * 2. Use the useCiferSdk() hook in any child component
 *
 * @example
 * ```tsx
 * // In a component:
 * const { sdk, isLoading, error } = useCiferSdk();
 *
 * if (isLoading) return <Spinner />;
 * if (!sdk) return <Error />;
 *
 * const chains = sdk.getSupportedChainIds();
 * const fee = await sdk.keyManagement.getSecretCreationFee({ ... });
 * ```
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { CiferSdk } from "cifer-sdk"
import { createCiferSdk } from "cifer-sdk"

// ------------------------------------------------------------------
// Context Type
// ------------------------------------------------------------------

interface CiferSdkContextValue {
  /** The initialized CIFER SDK instance (null while loading) */
  sdk: CiferSdk | null
  /** Whether the SDK is currently initializing */
  isLoading: boolean
  /** Error that occurred during initialization */
  error: Error | null
}

const CiferSdkContext = createContext<CiferSdkContextValue>({
  sdk: null,
  isLoading: true,
  error: null,
})

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------

interface CiferSdkProviderProps {
  children: ReactNode
  /** Override the Blackbox URL (defaults to NEXT_PUBLIC_BLACKBOX_URL env var) */
  blackboxUrl?: string
}

/**
 * CiferSdkProvider initializes the CIFER SDK and provides it via context.
 *
 * On mount, it calls createCiferSdk() which:
 * 1. Fetches /healthz from the Blackbox API (discovery)
 * 2. Discovers supported chains, RPC URLs, and controller addresses
 * 3. Creates a ReadClient for making on-chain queries
 *
 * The SDK instance is then available to all child components via useCiferSdk().
 */
export function CiferSdkProvider({
  children,
  blackboxUrl,
}: CiferSdkProviderProps) {
  const [sdk, setSdk] = useState<CiferSdk | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initSdk() {
      try {
        // Resolve the Blackbox URL from props or environment variable
        const url =
          blackboxUrl ||
          process.env.NEXT_PUBLIC_BLACKBOX_URL ||
          "https://cifer-blackbox.ternoa.dev:3010"

        console.log("[CIFER SDK] Initializing with discovery...")
        console.log("[CIFER SDK] Blackbox URL:", url)

        // Initialize the SDK with auto-discovery.
        // This fetches chain configs from the Blackbox API.
        const sdkInstance = await createCiferSdk({
          blackboxUrl: url,
          logger: (msg) => console.log(`[CIFER SDK] ${msg}`),
        })

        if (!cancelled) {
          // Log discovered chains for debugging
          const chainIds = sdkInstance.getSupportedChainIds()
          console.log("[CIFER SDK] Supported chains:", chainIds)

          setSdk(sdkInstance)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("[CIFER SDK] Initialization failed:", err)
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Failed to initialize SDK")
          )
          setIsLoading(false)
        }
      }
    }

    initSdk()

    return () => {
      cancelled = true
    }
  }, [blackboxUrl])

  return (
    <CiferSdkContext.Provider value={{ sdk, isLoading, error }}>
      {children}
    </CiferSdkContext.Provider>
  )
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------

/**
 * Hook to access the CIFER SDK instance from any component.
 *
 * @returns Object with sdk, isLoading, and error
 *
 * @example
 * ```tsx
 * const { sdk, isLoading, error } = useCiferSdk();
 *
 * // Get supported chain IDs
 * const chains = sdk?.getSupportedChainIds() ?? [];
 *
 * // Get controller address for a specific chain
 * const controller = sdk?.getControllerAddress(752025);
 *
 * // Access key management functions
 * const fee = await sdk?.keyManagement.getSecretCreationFee({
 *   chainId: 752025,
 *   controllerAddress: controller,
 *   readClient: sdk.readClient,
 * });
 * ```
 */
export function useCiferSdk(): CiferSdkContextValue {
  const context = useContext(CiferSdkContext)
  if (!context) {
    throw new Error("useCiferSdk must be used within a CiferSdkProvider")
  }
  return context
}
