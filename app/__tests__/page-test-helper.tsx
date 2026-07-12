import React from 'react';
import { vi } from 'vitest';

vi.mock('@/components/finder-hero', () => ({
  FinderHero: ({ title }: any) => (
    <div data-testid="slug-hero">
      <div data-testid="hero-title">{title}</div>
    </div>
  ),
}));

vi.mock('@/components/ui/motion', () => ({
  MotionSection: ({ children }: any) => <div>{children}</div>,
  MotionGroup: ({ children }: any) => <div>{children}</div>,
  MotionItem: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/breadcrumbs', () => ({
  Breadcrumbs: () => <nav>Breadcrumbs</nav>,
}));
