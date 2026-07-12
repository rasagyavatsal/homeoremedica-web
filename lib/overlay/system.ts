import { cva } from "class-variance-authority";
import { motionClassNames } from "@/lib/motion/system";

export const overlayBackdrop = cva(
  `fixed inset-0 z-50 bg-scrim/60 ${motionClassNames.overlayBackdrop}`
);

export const overlayVariants = cva(
  "z-50 border border-foreground/25 outline-none",
  {
    variants: {
      variant: {
        dialog: `fixed left-[50%] top-[50%] grid w-[calc(100vw-1rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-hidden rounded-md bg-card p-0 text-foreground sm:w-full ${motionClassNames.overlaySurface}`,
        sheet: `fixed inset-x-0 bottom-0 flex h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-md bg-card text-foreground ${motionClassNames.overlaySheet}`,
        responsiveDialog: `fixed bottom-0 left-1/2 -translate-x-1/2 flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] max-w-none flex-col overflow-hidden rounded-t-md bg-card text-foreground p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:w-[calc(100vw-2rem)] sm:max-h-[calc(100dvh-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md ${motionClassNames.overlaySurface}`,
        popover: `w-72 rounded-md bg-popover p-4 text-popover-foreground ${motionClassNames.overlayPopover}`,
        dropdown: `min-w-[12rem] overflow-hidden rounded-md bg-popover p-1.5 text-popover-foreground ${motionClassNames.overlayPopover}`,
        select: `relative max-h-96 min-w-[12rem] overflow-hidden rounded-md bg-popover text-popover-foreground`,
      },
    },
    defaultVariants: {
      variant: "dialog",
    },
  }
);

export const overlayRecipes = {
  picker: {
    viewport: "max-h-[min(60vh,32rem)] overflow-y-auto scrollbar-thin",
  },
  dialog: {
    centeredCompact: "w-[calc(100vw-1.5rem)] max-w-lg p-0 sm:w-[calc(100vw-2rem)]",
  }
} as const;
