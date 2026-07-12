"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { controlVariants, controlThumbVariants } from "@/lib/controls/system"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent data-[state=checked]:bg-primary data-[state=unchecked]:bg-input/50",
      controlVariants({ size: "switch", shape: "default", ring: "strong" }),
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(controlThumbVariants())}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
