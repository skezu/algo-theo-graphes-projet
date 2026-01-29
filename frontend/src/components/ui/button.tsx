import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[var(--accent-blue)] to-[#0066cc] text-white shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,var(--shadow-sm)] hover:from-[var(--accent-blue-hover)] hover:to-[var(--accent-blue)] hover:shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,var(--shadow-md)]",
        destructive:
          "bg-gradient-to-b from-[var(--accent-red)] to-[#cc2920] text-white shadow-[var(--shadow-sm)] hover:from-[#ff5c52] hover:to-[var(--accent-red)]",
        outline:
          "border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-elevated)]",
        secondary:
          "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--bg-tertiary)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
        link:
          "text-[var(--accent-blue)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
