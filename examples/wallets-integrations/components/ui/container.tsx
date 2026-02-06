import React from "react"

/**
 * Container component - constrains content to max-w-7xl with responsive padding.
 * Used as the primary layout wrapper in all sections.
 */
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Section wrapper with consistent vertical padding.
 */
export function Section({
  children,
  className = "",
  id = "",
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={`py-24 relative overflow-hidden ${className}`}
    >
      {children}
    </section>
  )
}
