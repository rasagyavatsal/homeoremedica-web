import { createElement, type ImgHTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BrandLockup } from '../brand-lockup';

vi.mock('next/image', () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => createElement('img', props),
}));

describe('BrandLockup', () => {
  it('renders theme-specific transparent logo assets', () => {
    render(<BrandLockup />);

    const lockup = screen.getByText('HomeoRemedica').parentElement;
    const images = lockup?.querySelectorAll('img');

    expect(images).toHaveLength(2);
    expect(images?.[0]).toHaveAttribute('src', '/logo/logo-light-transparent.png');
    expect(images?.[0]).toHaveClass('dark:hidden');
    expect(images?.[1]).toHaveAttribute('src', '/logo/logo-dark-transparent.png');
    expect(images?.[1]).toHaveClass('hidden', 'dark:block');
  });

  it('keeps the logo decorative when the wordmark is present', () => {
    render(<BrandLockup />);

    for (const image of screen.getByText('HomeoRemedica').parentElement?.querySelectorAll('img') ?? []) {
      expect(image).toHaveAttribute('alt', '');
    }
  });

  it('balances the wordmark size with the logo', () => {
    render(<BrandLockup />);

    expect(screen.getByText('HomeoRemedica')).toHaveClass('text-xl');
  });
});
