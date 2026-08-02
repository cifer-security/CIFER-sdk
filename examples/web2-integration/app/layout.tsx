import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Web2Provider } from "@/lib/web2-context"

// ------------------------------------------------------------------
// Fonts (CIFER Design System)
// ------------------------------------------------------------------
// Font families are defined in globals.css with system fallbacks so the
// example can build without fetching Google Fonts.

// ------------------------------------------------------------------
// Metadata
// ------------------------------------------------------------------

export const metadata: Metadata = {
  title: "CIFER Web2 Integration — SDK Example",
  description:
    "Example Next.js app demonstrating how to use the CIFER SDK Web2 functions: email registration, session management, secrets, delegates, permits, and encryption/decryption.",
}

// ------------------------------------------------------------------
// Root Layout
// ------------------------------------------------------------------

/**
 * Root layout for the Web2 Integration example.
 *
 * Sets up:
 * 1. Dark class on <html> for the CIFER dark theme
 * 2. Offline-capable system font fallbacks
 * 3. Web2Provider context so all pages share session state
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Web2Provider>{children}</Web2Provider>
      </body>
    </html>
  )
}
