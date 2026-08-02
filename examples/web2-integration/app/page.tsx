import Link from "next/link"
import { Container, Section } from "@/components/ui/container"
import {
  UserPlus,
  KeyRound,
  ShieldCheck,
  Key,
  Shield,
  Users,
  FileCheck,
  Search,
  Lock,
  FileUp,
  BarChart3,
  Trash2,
} from "lucide-react"

// ------------------------------------------------------------------
// Navigation items for all Web2 demo pages
// ------------------------------------------------------------------

const pages = [
  {
    name: "Register",
    description:
      "Create a new account with email and password. Verify via OTP and register an Ed25519 key for session signing.",
    href: "/register",
    icon: UserPlus,
    tag: "web2.auth",
    functions: ["register", "verifyEmail", "registerKey", "resendOtp"],
  },
  {
    name: "Reset Password",
    description:
      "Forgot your password? Request a password-reset OTP via email, then verify the OTP and set a new password.",
    href: "/reset-password",
    icon: KeyRound,
    tag: "web2.auth",
    functions: ["forgotPassword", "resetPassword"],
  },
  {
    name: "Delete Account",
    description:
      "Delete your account (soft-delete / dormant). Confirm via emailed OTP. Re-register with the same email to reactivate and restore your secrets.",
    href: "/delete-account",
    icon: Trash2,
    tag: "web2.auth",
    functions: ["requestAccountDeletion", "confirmAccountDeletion"],
  },
  {
    name: "Verify Credentials",
    description:
      "Web2 only: confirm email + password against the Blackbox principal store. Does not create a session.",
    href: "/verify-credentials",
    icon: ShieldCheck,
    tag: "web2.auth",
    functions: ["verifyCredentials"],
  },
  {
    name: "Session",
    description:
      "Create a managed session using your Ed25519 key. Sessions are auto-renewable and required for all authenticated operations.",
    href: "/session",
    icon: Key,
    tag: "web2.session",
    functions: ["createManagedSession"],
  },
  {
    name: "Secrets",
    description:
      "Create new Web2 secrets and list all secrets owned by your principal. Secrets are used for encryption/decryption.",
    href: "/secrets",
    icon: Shield,
    tag: "web2.secret",
    functions: ["createSecret", "listSecrets"],
  },
  {
    name: "Delegate",
    description:
      "Set or remove a delegate for a Web2 secret. Delegates can encrypt/decrypt data using your secret.",
    href: "/delegate",
    icon: Users,
    tag: "web2.delegate",
    functions: ["setDelegate"],
  },
  {
    name: "Permit",
    description:
      "Request permits for key rotation (email+password), secret transfer, or delegation operations.",
    href: "/permit",
    icon: FileCheck,
    tag: "web2.permit",
    functions: ["requestPermit"],
  },
  {
    name: "Principal Lookup",
    description:
      "Look up a principal by email address. Returns the principal UUID and email hex.",
    href: "/principal",
    icon: Search,
    tag: "web2.principal",
    functions: ["getByEmail"],
  },
  {
    name: "Payload Encrypt / Decrypt",
    description:
      "Encrypt a plaintext message and decrypt it on one page. Encryption results are auto-populated into the decrypt inputs.",
    href: "/payload",
    icon: Lock,
    tag: "web2.blackbox.payload",
    functions: ["encryptPayload", "decryptPayload"],
  },
  {
    name: "File Encrypt / Decrypt",
    description:
      "Encrypt a file into a .cifer.zip and decrypt it back — all on one page. Each operation runs as a background job.",
    href: "/files",
    icon: FileUp,
    tag: "web2.blackbox.files",
    functions: ["encryptFile", "decryptFile", "pollUntilComplete", "download"],
  },
  {
    name: "Data Consumption",
    description:
      "View encryption and decryption usage stats, plan limits, and remaining quota for the current billing period.",
    href: "/data-consumption",
    icon: BarChart3,
    tag: "web2.blackbox.jobs",
    functions: ["dataConsumption"],
  },
]

// ------------------------------------------------------------------
// Home Page — Web2 Function Navigation
// ------------------------------------------------------------------

/**
 * Home page for the CIFER Web2 Integration example.
 *
 * Displays navigation cards for all Web2 SDK functions.
 * The recommended flow is:
 * 1. Register → 2. Session → 3. Secrets → 4. Encrypt/Decrypt
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
              Web2 <span className="text-accent">Integration</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Demonstrates all{" "}
              <code className="text-zinc-300 font-mono text-sm bg-zinc-800/50 px-1.5 py-0.5 rounded">
                web2.*
              </code>{" "}
              functions from the CIFER SDK. No blockchain wallet needed
              &mdash; uses email registration and Ed25519 session signing.
            </p>
            <div className="mt-6 text-sm text-zinc-500 font-mono">
              Recommended flow: Register &rarr; Session &rarr; Secrets &rarr; Encrypt/Decrypt
            </div>
          </div>

          {/* ---- Cards Grid ---- */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pages.map((page) => (
              <Link key={page.name} href={page.href} className="group">
                <div className="glow-card p-6 h-full flex flex-col">
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-[rgba(0,255,157,0.1)] transition-colors">
                    <page.icon className="h-6 w-6 text-zinc-400 group-hover:text-[#00ff9d] transition-colors" />
                  </div>

                  {/* Tag */}
                  <span className="text-xs font-mono text-zinc-500 mb-2">
                    {page.tag}
                  </span>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-white mb-3">
                    {page.name}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                    {page.description}
                  </p>

                  {/* Functions list */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {page.functions.map((fn) => (
                      <span
                        key={fn}
                        className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded"
                      >
                        {fn}()
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-4 text-sm font-medium text-[#00ff9d] group-hover:text-white transition-colors">
                    View Example &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ---- Footer note ---- */}
          <div className="text-center mt-16">
            <p className="text-xs text-zinc-600 font-mono">
              State is shared across pages via React Context. Register first,
              then navigate to other pages to use your session.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  )
}
