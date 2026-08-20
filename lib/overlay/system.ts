import { cva } from "class-variance-authority";
import { motionClassNames } from "@/lib/motion/system";

export const overlayBackdrop = cva(
  `inset-0 z-50 bg-scrim/70 backdrop-blur-sm ${motionClassNames.overlayBackdrop}`,
  {
    variants: {
      contained: {
        false: "fixed",
        true: "absolute",
      },
    },
    defaultVariants: {
      contained: false,
    },
  }
);

export const overlayVariants = cva(
  "z-50 border border-border bg-popover text-popover-foreground shadow-overlay outline-none",
  {
    variants: {
      variant: {
        dialog: `overlay-dialog-position fixed grid gap-4 overflow-hidden rounded-2xl p-0 ${motionClassNames.overlaySurface}`,
        sheet: `overlay-sheet-position fixed inset-x-0 bottom-0 flex w-full flex-col overflow-hidden rounded-t-2xl ${motionClassNames.overlaySheet}`,
        sheetSide: `overlay-sheet-side-position fixed inset-y-0 left-0 flex h-dvh w-3/4 flex-col overflow-hidden ${motionClassNames.overlaySheetSide}`,
        responsiveDialog: `overlay-responsive-position fixed bottom-0 flex max-w-none flex-col overflow-hidden rounded-t-2xl p-0 sm:rounded-2xl ${motionClassNames.overlaySurface}`,
        popover: `w-72 rounded-xl p-4 ${motionClassNames.overlayPopover}`,
        dropdown: `min-w-48 overflow-hidden rounded-xl p-1.5 ${motionClassNames.overlayPopover}`,
        select: `relative max-h-96 min-w-48 overflow-hidden rounded-xl`,
      },
    },
    defaultVariants: {
      variant: "dialog",
    },
  }
);

export const overlayRecipes = {
  picker: {
    viewport: "overlay-picker-viewport scrollbar-thin",
    searchViewport: "search-overlay-results scrollbar-thin",
  },
  dialog: {
    centeredCompact: "overlay-compact-width max-w-dialog p-0",
  }
} as const;
