import { describe, expect, it } from 'vitest';

import {
  MOTION_DURATIONS,
  MOTION_DISTANCES,
  createEnterTransition,
  createFadeUpVariants,
  createGroupVariants,
  getMotionDuration,
} from '@/lib/motion/system';

describe('motion system', () => {
  it('keeps full duration when reduced motion is disabled', () => {
    expect(getMotionDuration(0.24, false)).toBe(0.24);
  });

  it('caps durations when reduced motion is enabled', () => {
    expect(getMotionDuration(0.24, true)).toBe(MOTION_DURATIONS.reduced);
    expect(getMotionDuration(0.1, true)).toBe(0.1);
  });

  it('removes transform distance in reduced motion fade-up variants', () => {
    const variants = createFadeUpVariants({ reducedMotion: true, distance: 12 });
    expect(variants.hidden).toMatchObject({ opacity: 0, y: 0 });
    expect(variants.visible).toMatchObject({ opacity: 1, y: 0 });
  });

  it('removes stagger and delays for reduced motion groups', () => {
    const regular = createGroupVariants({
      reducedMotion: false,
      stagger: 0.05,
      delayChildren: 0.03,
    });
    const reduced = createGroupVariants({
      reducedMotion: true,
      stagger: 0.05,
      delayChildren: 0.03,
    });

    expect((regular.visible as any).transition).toMatchObject({
      delayChildren: 0.03,
      staggerChildren: 0.05,
    });
    expect((reduced.visible as any).transition).toMatchObject({
      delayChildren: 0,
      staggerChildren: 0,
    });
  });

  it('removes transition delay when reduced motion is enabled', () => {
    const regular = createEnterTransition({
      reducedMotion: false,
      duration: 0.22,
      delay: 0.04,
    });
    const reduced = createEnterTransition({
      reducedMotion: true,
      duration: 0.22,
      delay: 0.04,
    });

    expect(regular).toMatchObject({ duration: 0.22, delay: 0.04 });
    expect(reduced).toMatchObject({ duration: MOTION_DURATIONS.reduced, delay: 0 });
  });

  it('aligns CSS motion variables with JS constants', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const cssPath = path.resolve(process.cwd(), 'app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Durations
    expect(cssContent).toContain(`--motion-duration-page: ${MOTION_DURATIONS.page * 1000}ms;`);
    expect(cssContent).toContain(`--motion-duration-section: ${MOTION_DURATIONS.section * 1000}ms;`);
    expect(cssContent).toContain(`--motion-duration-item: ${MOTION_DURATIONS.item * 1000}ms;`);
    expect(cssContent).toContain(`--motion-duration-overlay: ${MOTION_DURATIONS.overlay * 1000}ms;`);
    expect(cssContent).toContain(`--motion-duration-reduced: ${MOTION_DURATIONS.reduced * 1000}ms;`);

    // Distances
    expect(cssContent).toContain(`--motion-distance-page: ${MOTION_DISTANCES.page}px;`);
    expect(cssContent).toContain(`--motion-distance-section: ${MOTION_DISTANCES.section}px;`);
    expect(cssContent).toContain(`--motion-distance-item: ${MOTION_DISTANCES.item}px;`);
    expect(cssContent).toContain(`--motion-distance-overlay: ${MOTION_DISTANCES.overlay}px;`);
  });
});
