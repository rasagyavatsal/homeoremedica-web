import { cva } from "class-variance-authority"

export const controlVariants = cva(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-11 px-3 py-2 text-sm",
        sm: "h-9 px-3 text-sm",
        header: "min-h-9 px-3 py-1.5 text-sm",
        "header-icon": "h-9 w-9",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        switch: "h-6 w-11",
        textarea: "min-h-[100px] px-3 py-2 text-sm",
        button: "h-11 px-4 py-2 text-sm",
        "inline-link": "min-h-10 px-1.5",
        pill: "min-h-10 px-3 py-2 text-sm",
      },
      shape: {
        default: "rounded-lg",
        sm: "rounded-md",
        full: "rounded-full",
      },
      ring: {
        default: "focus-visible:ring-ring/20",
        strong: "focus-visible:ring-ring",
      }
    },
    defaultVariants: {
      size: "default",
      shape: "default",
      ring: "default",
    },
  }
)

export const controlThumbVariants = cva(
  "pointer-events-none block bg-surface-bright ring-0 transition-transform",
  {
    variants: {
      size: {
        default: "h-5 w-5 rounded-sm data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)
