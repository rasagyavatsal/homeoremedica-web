import type { Transition, Variants } from 'framer-motion';

/*
 * Quiet motion is reserved for orientation and state change. Static sections
 * do not animate merely because they rendered.
 */
export const MOTION_DURATIONS = {
  page: 0.42,
  section: 0.34,
  item: 0.24,
  overlay: 0.28,
  reduced: 0.08,
} as const;

export const MOTION_DISTANCES = {
  page: 12,
  section: 8,
  item: 4,
  overlay: 10,
} as const;

export const MOTION_STAGGER = { group: 0.045 } as const;

export const MOTION_EASING: readonly [number, number, number, number] = [
  0.22,
  1,
  0.36,
  1,
];

export const motionClassNames = {
  surface: 'motion-surface',
  press: 'motion-press',
  overlayBackdrop: 'motion-overlay-backdrop',
  overlaySurface: 'motion-overlay-surface',
  overlaySheet: 'motion-overlay-sheet',
  overlayPopover: 'motion-overlay-popover',
} as const;

export function getMotionDuration(duration: number, reducedMotion: boolean): number {
  return reducedMotion ? Math.min(duration, MOTION_DURATIONS.reduced) : duration;
}

export function createQuietRevealVariants({
  reducedMotion,
  distance,
}: {
  reducedMotion: boolean;
  distance: number;
}): Variants {
  return {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : distance,
      filter: reducedMotion ? 'none' : 'blur(2px)',
    },
    visible: { opacity: 1, y: 0, filter: 'none' },
  };
}

export function createQuietItemVariants({ reducedMotion }: { reducedMotion: boolean }): Variants {
  return {
    hidden: { opacity: 0, scale: reducedMotion ? 1 : 0.99 },
    visible: { opacity: 1, scale: 1 },
  };
}

export function createEnterTransition({
  reducedMotion,
  duration,
  delay = 0,
}: {
  reducedMotion: boolean;
  duration: number;
  delay?: number;
}): Transition {
  return {
    type: 'tween',
    ease: MOTION_EASING,
    duration: getMotionDuration(duration, reducedMotion),
    delay: reducedMotion ? 0 : delay,
  };
}

export function createGroupVariants({
  reducedMotion,
  stagger = MOTION_STAGGER.group,
  delayChildren = 0,
}: {
  reducedMotion: boolean;
  stagger?: number;
  delayChildren?: number;
}): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reducedMotion ? 0 : delayChildren,
        staggerChildren: reducedMotion ? 0 : stagger,
      },
    },
  };
}
