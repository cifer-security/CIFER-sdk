import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button variants following the CIFER Design System.
 *
 * Variants:
 * - accent: Primary CTA with cyber green glow
 * - default: Standard primary button
 * - destructive: Danger actions
 * - outline: Secondary actions with hover glow
 * - ghost: Subtle hover effect
 * - link: Text-only link style
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        accent:
          "bg-[#00ff9d] text-[#09090b] font-semibold shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:bg-[#00ff9d]/90 hover:shadow-[0_0_30px_rgba(0,255,157,0.5)] transition-all",
        default:
          "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,255,157,0.3)] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-shadow",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-[#27272a] bg-transparent shadow-xs hover:bg-[rgba(0,255,157,0.1)] hover:border-[rgba(0,255,157,0.5)] hover:shadow-[0_0_15px_rgba(0,255,157,0.15)] transition-all",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d] transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
