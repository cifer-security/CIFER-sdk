"use client"

/**
 * ConnectWallet Component
 *
 * Landing screen shown when no wallet is connected.
 * Provides multiple wallet connection options via Thirdweb:
 * - Email (embedded wallet)
 * - Google OAuth (embedded wallet)
 * - Facebook OAuth (embedded wallet)
 * - MetaMask (external wallet)
 *
 * Uses the Thirdweb ConnectButton component which handles the
 * connection flow UI (modals, OTP verification, OAuth redirects).
 */

import { ConnectButton } from "thirdweb/react"
import { thirdwebClient, wallets } from "@/lib/thirdweb-client"
import { Container } from "@/components/ui/container"
import { Key, Shield, Cpu } from "lucide-react"

export function ConnectWallet() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl">
        <Container>
          <div className="flex items-center h-14 sm:h-16">
            <span
              className="text-lg sm:text-xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-logo)" }}
            >
              CIFER{" "}
              <span className="text-[#00ff9d]">Secrets Manager</span>
            </span>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full space-y-8 text-center">
          {/* Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-[#00ff9d] mr-2 animate-pulse" />
              SDK Example — Key Management
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              Manage Your CIFER{" "}
              <span className="text-[#00ff9d] text-glow">Secrets</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md mx-auto">
              Create, delegate, and transfer quantum-resistant encryption secrets
              across multiple chains using the CIFER SDK.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Key className="h-5 w-5 text-[#00ff9d]" />
              <span className="text-xs text-zinc-400">Key Management</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Shield className="h-5 w-5 text-[#00ff9d]" />
              <span className="text-xs text-zinc-400">Multi-Chain</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Cpu className="h-5 w-5 text-[#00ff9d]" />
              <span className="text-xs text-zinc-400">ML-KEM-768</span>
            </div>
          </div>

          {/* Connect Button */}
          <div className="space-y-4">
            <div className="flex justify-center">
              {/*
                Thirdweb ConnectButton handles the entire wallet connection flow:
                - Shows a modal with wallet options (email, Google, Facebook, MetaMask)
                - Handles OTP verification for email
                - Handles OAuth redirects for Google/Facebook
                - Creates embedded wallets for social logins
                - Connects MetaMask via browser extension
              */}
              <ConnectButton
                client={thirdwebClient}
                wallets={wallets}
                connectButton={{
                  label: "Connect Wallet",
                  style: {
                    backgroundColor: "#00ff9d",
                    color: "#09090b",
                    fontWeight: "600",
                    fontSize: "16px",
                    padding: "16px 32px",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 0 20px rgba(0, 255, 157, 0.3)",
                    width: "100%",
                    maxWidth: "320px",
                  },
                }}
                theme="dark"
              />
            </div>

            <p className="text-xs text-zinc-600">
              Sign in with Email, Google, Facebook, or MetaMask
            </p>
          </div>

          {/* SDK Info */}
          <div className="pt-4 border-t border-zinc-800/50">
            <p className="text-xs text-zinc-600">
              Powered by{" "}
              <code className="text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                cifer-sdk
              </code>{" "}
              — Quantum-resistant encryption infrastructure
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
