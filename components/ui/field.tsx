import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly density?: "standard" | "compact"
}

export function Field({ className, density = "standard", ...props }: Readonly<FieldProps>) {
  return (
    <div
      className={cn(
        density === "compact" ? "space-y-1.5" : "space-y-2.5",
        className
      )}
      {...props}
    />
  )
}

export function FieldLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Label>) {
  return <Label className={cn(className)} {...props} />
}

export function FieldHint({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs leading-relaxed text-on-surface-variant", className)}
      {...props}
    />
  )
}

export function FieldError({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs leading-relaxed text-destructive", className)}
      {...props}
    />
  )
}
