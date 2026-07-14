"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const AUDIENCES = ['Doctors', 'Practitioners', 'Students'] as const;
const ROTATION_INTERVAL_MS = 3_000;

export function HeroHeading() {
  const [audienceIndex, setAudienceIndex] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;
  const audience = AUDIENCES[audienceIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAudienceIndex((currentIndex) => (currentIndex + 1) % AUDIENCES.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <h1
      aria-label={`Homoeopathic Remedy Finder for ${audience}`}
      className="display-lg font-medium"
    >
      <span aria-hidden="true">
        Homoeopathic Remedy Finder
        <span className="mt-2 block md:mt-3">
          for{' '}
          <span
            data-testid="hero-audience"
            className="relative inline-grid overflow-hidden align-bottom text-primary"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={audience}
                className="col-start-1 row-start-1 inline-block"
                initial={reducedMotion ? false : { opacity: 0, y: '60%', filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: '-60%', filter: 'blur(4px)' }}
                transition={{ duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                {audience}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      </span>
    </h1>
  );
}
