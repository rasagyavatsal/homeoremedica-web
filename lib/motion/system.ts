import type { Transition, Variants } from 'framer-motion';

/*
 * Print-crisp motion: short distances, fast decisive settles.
 * Surfaces stamp into place rather than drift in.
 */
export const MOTION_DURATIONS = {
  page: 0.18,
  section: 0.16,
  item: 0.14,
  overlay: 0.16,
  reduced: 0.1,
} as const;

export const MOTION_DISTANCES = {
  page: 8,
  section: 6,
  item: 4,
  overlay: 8,
} as const;

export const MOTION_STAGGER = {
  group: 0.03,
} as const;

export const MOTION_EASING: readonly [number, number, number, number] = [
  0.3,
  0.85,
  0.15,
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
  if (!reducedMotion) {
    return duration;
  }

  return Math.min(duration, MOTION_DURATIONS.reduced);
}

export function createFadeUpVariants({
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
    },
    visible: {
      opacity: 1,
      y: 0,
    },
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
