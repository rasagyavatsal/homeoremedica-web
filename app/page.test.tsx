import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HomePage from './page';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: () => <span data-testid="next-image" />,
}));

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

describe('HomePage', () => {
  it('introduces the product and sends the primary action to the dedicated finder', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'A quieter way to find the remedy.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a remedy' })).toHaveAttribute(
      'href',
      '/find-remedy',
    );
    expect(screen.getByRole('region', { name: 'Classical sources' })).toBeInTheDocument();
    expect(screen.queryByTestId('symptom-search')).not.toBeInTheDocument();
  });
});
