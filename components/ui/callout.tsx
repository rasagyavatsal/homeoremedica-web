import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "flex gap-3 rounded-md border border-border px-4 py-3 text-sm leading-relaxed",
  {
    variants: {
      variant: {
        default: "bg-surface-bright text-on-surface-variant",
        info: "border-primary bg-accent text-on-surface-variant",
        success: "border-success bg-accent text-success-foreground",
        warning: "border-warning bg-secondary-container text-warning-foreground",
        destructive: "border-destructive bg-secondary-container text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CalloutProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof calloutVariants> {
  readonly icon?: React.ReactNode
}

export function Callout({
  className,
  variant,
  icon,
  children,
  ...props
}: Readonly<CalloutProps>) {
  const content = (
    <>
      {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </>
  )

  if (variant === "destructive") {
    return (
      <div
        role="alert"
        className={cn(calloutVariants({ variant }), className)}
        {...props}
      >
        {content}
      </div>
    )
  }

  return (
    <output
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    >
      {content}
    </output>
  )
}
