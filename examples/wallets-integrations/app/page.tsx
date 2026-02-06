import Link from "next/link"
import { Container, Section } from "@/components/ui/container"
import { Wallet, Globe, Shield } from "lucide-react"

// ------------------------------------------------------------------
// Wallet options to display on the home page
// ------------------------------------------------------------------

const wallets = [
  {
    name: "MetaMask",
    description:
      "Connect via the MetaMask browser extension using the EIP-1193 provider (window.ethereum). No extra npm packages needed — uses the SDK's built-in Eip1193SignerAdapter.",
    href: "/metamask",
    icon: Wallet,
    tag: "EIP-1193",
  },
  {
    name: "Thirdweb",
    description:
      "Connect using the Thirdweb SDK which supports email, social login, and external wallets. Demonstrates a custom signer adapter that bridges Thirdweb's Account to cifer-sdk.",
    href: "/thirdweb",
    icon: Shield,
    tag: "Thirdweb SDK",
  },
  {
    name: "WalletConnect",
    description:
      "Connect any mobile wallet via WalletConnect v2 QR code scanning. Uses @walletconnect/ethereum-provider to create an EIP-1193 provider, then wraps it with cifer-sdk's Eip1193SignerAdapter.",
    href: "/walletconnect",
    icon: Globe,
    tag: "WalletConnect v2",
  },
]

// ------------------------------------------------------------------
// Home Page — Wallet Selection
// ------------------------------------------------------------------

/**
 * Home page for the CIFER Wallet Integrations example.
 *
 * Displays three wallet cards. Clicking one navigates to a dedicated
 * page where ALL integration code lives in a single file so developers
 * can easily see how each wallet type works with cifer-sdk.
 */
export default function HomePage() {
  return (
    <div className="page-bg min-h-screen">
      <Section>
        <Container>
          {/* ---- Header ---- */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-mono text-zinc-500 mb-4 tracking-wider uppercase">
              cifer-sdk / examples
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Wallet <span className="text-accent">Integrations</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Choose a wallet type below to see a complete, self-contained
              integration example. Each page connects a wallet and calls{" "}
              <code className="text-zinc-300 font-mono text-sm bg-zinc-800/50 px-1.5 py-0.5 rounded">
                getSecretCreationFee()
              </code>{" "}
              from the CIFER SDK.
            </p>
          </div>

          {/* ---- Wallet Cards Grid ---- */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {wallets.map((wallet) => (
              <Link key={wallet.name} href={wallet.href} className="group">
                <div className="glow-card p-6 h-full flex flex-col">
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-[rgba(0,255,157,0.1)] transition-colors">
                    <wallet.icon className="h-6 w-6 text-zinc-400 group-hover:text-[#00ff9d] transition-colors" />
                  </div>

                  {/* Tag */}
                  <span className="text-xs font-mono text-zinc-500 mb-2">
                    {wallet.tag}
                  </span>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-white mb-3">
                    {wallet.name}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                    {wallet.description}
                  </p>

                  {/* CTA */}
                  <div className="mt-6 text-sm font-medium text-[#00ff9d] group-hover:text-white transition-colors">
                    View Example →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ---- Footer note ---- */}
          <div className="text-center mt-16">
            <p className="text-xs text-zinc-600 font-mono">
              Each page is a single self-contained file — open{" "}
              <code>app/[wallet]/page.tsx</code> to see the full code.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  )
}
