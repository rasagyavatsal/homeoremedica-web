import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "flex gap-3 rounded-sm border border-border/40 border-l-[3px] px-4 py-3 text-sm leading-relaxed",
  {
    variants: {
      variant: {
        default: "border-l-foreground/50 bg-surface-bright text-on-surface-variant",
        info: "border-l-primary bg-primary/[0.06] text-on-surface-variant",
        success: "border-l-success bg-success/[0.07] text-success-foreground",
        warning: "border-l-warning bg-warning/10 text-warning-foreground",
        destructive: "border-l-destructive bg-destructive/[0.06] text-destructive",
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
