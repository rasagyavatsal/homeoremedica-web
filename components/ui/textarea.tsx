import * as React from "react"
import { controlVariants } from "@/lib/controls/system"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full border border-input/55 bg-surface-bright text-foreground ring-offset-background placeholder:text-on-surface-variant/60 focus-visible:border-input",
          controlVariants(),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
