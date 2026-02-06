import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { ThirdwebProvider } from "@/components/providers/thirdweb-provider"
import { CiferSdkProvider } from "@/lib/cifer-sdk-context"
import "./globals.css"

// ------------------------------------------------------------------
// Fonts (CIFER Design System)
// ------------------------------------------------------------------

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["700"],
})

// ------------------------------------------------------------------
// Metadata
// ------------------------------------------------------------------

export const metadata: Metadata = {
  title: "CIFER Secrets Manager — SDK Example",
  description:
    "Example Next.js app demonstrating CIFER SDK key management functions. Create, delegate, transfer, and inspect secrets across multiple chains.",
}

// ------------------------------------------------------------------
// Root Layout
// ------------------------------------------------------------------

/**
 * Root layout wraps the entire application with:
 * 1. ThirdwebProvider - Enables wallet connection hooks
 * 2. CiferSdkProvider - Initializes the CIFER SDK with auto-discovery
 *
 * The dark class on <html> activates the CIFER dark theme CSS variables.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <ThirdwebProvider>
          <CiferSdkProvider>
            {children}
          </CiferSdkProvider>
        </ThirdwebProvider>
      </body>
    </html>
  )
}
