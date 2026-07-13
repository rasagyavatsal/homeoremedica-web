import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motionClassNames } from "@/lib/motion/system"
import { controlVariants } from "@/lib/controls/system"
import { cn } from "@/lib/utils"

const buttonBaseVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors ${motionClassNames.press} disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary text-primary-foreground hover:border-primary-container hover:bg-primary-container",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground hover:opacity-90",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary hover:bg-accent",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-secondary-container",
        ghost:
          "text-on-surface-variant hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        tertiary:
          "border border-border bg-accent text-accent-foreground hover:border-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ButtonVariantsProps extends VariantProps<typeof buttonBaseVariants> {
  size?: "default" | "sm" | "lg" | "icon" | "header" | "header-icon"
}

const buttonVariants = ({ variant, size, className }: ButtonVariantsProps & { className?: string }) => {
  return cn(
    controlVariants({
      size: size === "default" || !size ? "button" : size,
      shape: size === "header" ? "sm" : "default",
      ring: "strong"
    }),
    buttonBaseVariants({ variant }),
    className
  )
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantsProps {
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
