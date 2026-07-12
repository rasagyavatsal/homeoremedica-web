import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  MotionRouteShell,
  MotionSafeShell,
  MotionItem
} from '../motion';

describe('Motion Semantic Policies', () => {
  it('MotionRouteShell renders with hidden initial state for entrance animation', () => {
    render(
      <MotionRouteShell data-testid="route-shell">Content</MotionRouteShell>
    );
    const element = screen.getByTestId('route-shell');
    // Framer motion applies inline styles for initial hidden state if variants have it
    // Or we can check if it has the variants by checking the output or we can just snapshot it.
    // Actually, JSDOM doesn't run the animation fully, but inline styles are applied.
    expect(element.style.opacity).toBe('0');
  });

  it('MotionSafeShell renders immediately without hiding content on first paint', () => {
    render(
      <MotionSafeShell data-testid="safe-shell">Content</MotionSafeShell>
    );
    const element = screen.getByTestId('safe-shell');
    // Should NOT have opacity: 0 on initial render
    expect(element.style.opacity).not.toBe('0');
  });

  it('MotionSafeShell does not propagate hidden state to nested motion elements', () => {
    render(
      <MotionSafeShell>
        <MotionItem data-testid="nested-item">Content</MotionItem>
      </MotionSafeShell>
    );
    const element = screen.getByTestId('nested-item');
    // Because MotionItem has variants but no initial/animate of its own,
    // it would inherit 'hidden' if MotionSafeShell propagated it.
    // If we isolated MotionSafeShell correctly, the child shouldn't be forced into hidden state.
    expect(element.style.opacity).not.toBe('0');
  });
});
