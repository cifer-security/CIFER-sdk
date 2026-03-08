"use client"

/**
 * Web2 React Context
 *
 * Shares session state, principal info, SDK instance, and Ed25519 signer
 * across all pages so users can register on one page and use their session
 * on subsequent pages without re-entering credentials.
 *
 * State is stored in React context (in-memory) — it resets on page reload.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react"

import { createCiferSdk, type CiferSdk } from "cifer-sdk"
import type { Web2Session } from "cifer-sdk"
import type { StoredEd25519Signer } from "./ed25519"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default Blackbox URL — change this to your deployment */
const DEFAULT_BLACKBOX_URL = "https://cifer-blackbox.ternoa.dev:3010"

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface Web2ContextValue {
  /** The CIFER SDK instance (null until initialized) */
  sdk: CiferSdk | null
  /** Whether the SDK is still initializing */
  sdkLoading: boolean
  /** SDK initialization error */
  sdkError: string

  /** The Blackbox URL */
  blackboxUrl: string

  /** The registered principal ID (set after registration) */
  principalId: string
  setPrincipalId: (id: string) => void

  /** The user's email (set during registration) */
  email: string
  setEmail: (email: string) => void

  /** The user's password (kept for key registration & permits) */
  password: string
  setPassword: (password: string) => void

  /** The Ed25519 signer (generated during key registration) */
  ed25519Signer: StoredEd25519Signer | null
  setEd25519Signer: (signer: StoredEd25519Signer | null) => void

  /** The active Web2 session (set after createManagedSession) */
  session: Web2Session | null
  setSession: (session: Web2Session | null) => void

  /**
   * Ref to the latest session — use `sessionRef.current` inside async
   * callbacks so you always read the *newest* session, even if the
   * callback was created with a stale closure.
   */
  sessionRef: React.RefObject<Web2Session | null>

  /** Shared log function */
  logs: string[]
  log: (message: string) => void
  clearLogs: () => void
}

const Web2Context = createContext<Web2ContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function Web2Provider({ children }: { children: React.ReactNode }) {
  // SDK state
  const [sdk, setSdk] = useState<CiferSdk | null>(null)
  const [sdkLoading, setSdkLoading] = useState(true)
  const [sdkError, setSdkError] = useState("")

  // User state
  const [principalId, setPrincipalId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [ed25519Signer, setEd25519Signer] = useState<StoredEd25519Signer | null>(null)
  const [session, _setSession] = useState<Web2Session | null>(null)
  const sessionRef = useRef<Web2Session | null>(null)

  /** Update both React state (for UI reactivity) and the ref (for latest-value reads). */
  const setSession = useCallback((s: Web2Session | null) => {
    sessionRef.current = s
    _setSession(s)
  }, [])

  // Logs
  const [logs, setLogs] = useState<string[]>([])
  const log = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ])
    console.log(`[Web2 Example] ${message}`)
  }, [])
  const clearLogs = useCallback(() => setLogs([]), [])

  // Initialize SDK on mount
  useEffect(() => {
    async function init() {
      try {
        log("Initializing CIFER SDK...")
        const sdkInstance = await createCiferSdk({
          blackboxUrl: DEFAULT_BLACKBOX_URL,
        })
        setSdk(sdkInstance)
        log("SDK initialized successfully")
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setSdkError(msg)
        log(`ERROR: Failed to initialize SDK: ${msg}`)
      } finally {
        setSdkLoading(false)
      }
    }
    init()
  }, [log])

  const value = useMemo<Web2ContextValue>(
    () => ({
      sdk,
      sdkLoading,
      sdkError,
      blackboxUrl: DEFAULT_BLACKBOX_URL,
      principalId,
      setPrincipalId,
      email,
      setEmail,
      password,
      setPassword,
      ed25519Signer,
      setEd25519Signer,
      session,
      setSession,
      sessionRef,
      logs,
      log,
      clearLogs,
    }),
    [
      sdk,
      sdkLoading,
      sdkError,
      principalId,
      email,
      password,
      ed25519Signer,
      session,
      logs,
      log,
      clearLogs,
    ]
  )

  return <Web2Context.Provider value={value}>{children}</Web2Context.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWeb2(): Web2ContextValue {
  const ctx = useContext(Web2Context)
  if (!ctx) {
    throw new Error("useWeb2 must be used within a Web2Provider")
  }
  return ctx
}
