import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-1 font-code text-micro font-medium tracking-label leading-none focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-primary bg-accent text-accent-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        destructive: "border-destructive bg-secondary-container text-destructive",
        outline: "border-border bg-transparent text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
