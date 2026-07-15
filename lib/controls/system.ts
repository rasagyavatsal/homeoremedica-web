import { cva } from "class-variance-authority"

export const controlVariants = cva(
  "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-control px-4 py-2 text-sm",
        sm: "h-control-sm px-3 text-sm",
        header: "min-h-touch px-3 py-2 text-sm",
        "header-icon": "h-control-sm w-control-sm",
        lg: "h-control-lg px-6 text-base",
        icon: "h-control w-control",
        switch: "h-6 w-11",
        textarea: "min-h-24 px-4 py-3 text-sm",
        button: "h-control px-4 py-2 text-sm",
        "inline-link": "min-h-touch px-1.5",
        pill: "min-h-touch px-3 py-2 text-sm",
      },
      shape: {
        default: "rounded-md",
        sm: "rounded-sm",
        full: "rounded-full",
      },
      ring: {
        default: "",
        strong: "",
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
