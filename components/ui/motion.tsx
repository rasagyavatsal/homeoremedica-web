"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

import {
  MOTION_DISTANCES,
  MOTION_DURATIONS,
  createEnterTransition,
  createFadeUpVariants,
  createGroupVariants,
} from '@/lib/motion/system';
import { cn } from '@/lib/utils';

type BaseMotionProps = Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'whileInView' | 'viewport' | 'variants' | 'transition'
>;

type MotionContainerProps = BaseMotionProps & {
  delay?: number;
  distance?: number;
};

type MotionGroupProps = BaseMotionProps & {
  stagger?: number;
  delayChildren?: number;
};

export function MotionRouteShell({
  className,
  children,
  delay = 0,
  distance = MOTION_DISTANCES.page,
  ...props
}: MotionContainerProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const variants = createFadeUpVariants({ reducedMotion, distance });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={createEnterTransition({
        reducedMotion,
        duration: MOTION_DURATIONS.page,
        delay,
      })}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionSafeShell({
  className,
  children,
  ...props
}: Omit<MotionContainerProps, 'delay' | 'distance'>) {
  // Safe shell provides a clean boundary without propagating hidden initial state to children
  // that do not explicitly opt-in to entrance animations.
  return (
    <motion.div
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionOverlay({
  className,
  children,
  delay = 0,
  distance = MOTION_DISTANCES.overlay,
  ...props
}: MotionContainerProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const variants = createFadeUpVariants({ reducedMotion, distance });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={createEnterTransition({
        reducedMotion,
        duration: MOTION_DURATIONS.overlay,
        delay,
      })}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionSection({
  className,
  children,
  delay = 0,
  distance = MOTION_DISTANCES.section,
  ...props
}: MotionContainerProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const variants = createFadeUpVariants({ reducedMotion, distance });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={createEnterTransition({
        reducedMotion,
        duration: MOTION_DURATIONS.section,
        delay,
      })}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionGroup({
  className,
  children,
  stagger,
  delayChildren,
  ...props
}: MotionGroupProps) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={createGroupVariants({ reducedMotion, stagger, delayChildren })}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  className,
  children,
  delay = 0,
  distance = MOTION_DISTANCES.item,
  ...props
}: MotionContainerProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const variants = createFadeUpVariants({ reducedMotion, distance });

  return (
    <motion.div
      variants={variants}
      transition={createEnterTransition({
        reducedMotion,
        duration: MOTION_DURATIONS.item,
        delay,
      })}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionReveal({
  className,
  children,
  distance = MOTION_DISTANCES.section,
  ...props
}: Omit<MotionContainerProps, 'delay'>) {
  const reducedMotion = useReducedMotion() ?? false;
  const variants = createFadeUpVariants({ reducedMotion, distance });

  if (reducedMotion) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={createEnterTransition({
          reducedMotion,
          duration: MOTION_DURATIONS.section,
        })}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={createEnterTransition({
        reducedMotion,
        duration: MOTION_DURATIONS.section,
      })}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
