"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const AUDIENCES = ['Doctors', 'Practitioners', 'Students'] as const;
const ROTATION_INTERVAL_MS = 3_000;

export function HeroHeading() {
  const [audienceIndex, setAudienceIndex] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;
  const audience = AUDIENCES[audienceIndex];
  const transition = reducedMotion ? { duration: 0 } : {
    type: 'spring' as const,
    stiffness: 180,
    damping: 24,
    mass: 0.8,
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAudienceIndex((currentIndex) => (currentIndex + 1) % AUDIENCES.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <h1
      aria-label={`Homeopathic Remedy Finder for ${audience}`}
      className="display-lg font-medium"
    >
      <span aria-hidden="true">
        Homeopathic Remedy Finder
        <span className="mt-2 block md:mt-3">
          <motion.span
            layout={!reducedMotion}
            className="inline-flex items-baseline gap-2"
            transition={transition}
          >
            for
            <motion.span
              layout={!reducedMotion}
              data-testid="hero-audience"
              className="relative inline-grid overflow-hidden align-bottom text-left text-primary"
              transition={transition}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={audience}
                  className="col-start-1 row-start-1 inline-block"
                  initial={reducedMotion ? false : { opacity: 0, y: '55%', filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: '-55%', filter: 'blur(4px)' }}
                  transition={transition}
                >
                  {audience}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </motion.span>
        </span>
      </span>
    </h1>
  );
}
