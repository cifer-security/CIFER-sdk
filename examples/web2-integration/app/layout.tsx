import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Web2Provider } from "@/lib/web2-context"

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
 * 2. Google Fonts (Geist, Geist Mono, Space Grotesk)
 * 3. Web2Provider context so all pages share session state
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
        <Web2Provider>{children}</Web2Provider>
      </body>
    </html>
  )
}
