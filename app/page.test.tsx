import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HomePage from './page';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: ({ className, sizes }: { className?: string; sizes?: string }) => (
    <span data-testid="next-image" className={className} data-sizes={sizes} />
  ),
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
      screen.getByRole('heading', {
        level: 1,
        name: 'Homoeopathic Remedy Finder for Doctors',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a remedy' })).toHaveAttribute(
      'href',
      '/find-remedy',
    );
    expect(screen.getByRole('link', { name: 'Android app' })).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=com.rasagyavatsal.homeoremedica',
    );
    expect(screen.queryByRole('link', { name: 'See how it works' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Classical sources' })).toBeInTheDocument();
    expect(screen.queryByTestId('symptom-search')).not.toBeInTheDocument();

    const hero = screen.getByRole('heading', { level: 1 }).parentElement;
    expect(hero).toHaveClass('text-center');
    expect(screen.getByRole('region', { name: 'Remedy finder demonstration' }))
      .toHaveClass('preview-device');
  });

  it('rotates the hero audience through practitioners and students', () => {
    vi.useFakeTimers();
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    const audience = screen.getByTestId('hero-audience');

    expect(heading).toHaveClass('display-lg');
    expect(audience).toHaveClass('text-primary');
    expect(audience.parentElement).toHaveClass('gap-2');
    expect(audience).toHaveTextContent('Doctors');
    expect(screen.queryByTestId('hero-audience-sizer')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3_000));
    expect(heading).toHaveAccessibleName('Homoeopathic Remedy Finder for Practitioners');

    act(() => vi.advanceTimersByTime(3_000));
    expect(heading).toHaveAccessibleName('Homoeopathic Remedy Finder for Students');

    vi.useRealTimers();
  });

  it('does not render decorative copy above landing-page headings', () => {
    render(<HomePage />);

    [
      'Homoeopathic remedy research',
      'A considered workflow',
      'Classical sources',
      'Begin when ready',
    ].forEach((label) => expect(screen.queryByText(label)).not.toBeInTheDocument());
  });

  it('keeps the classical sources section focused on large book covers and names', () => {
    render(<HomePage />);

    expect(screen.queryByText('Less interface. More attention.')).not.toBeInTheDocument();
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Four books. One place to search.' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Practical bedside reference')).not.toBeInTheDocument();

    screen.getAllByTestId('next-image').forEach((cover) => {
      expect(cover).toHaveClass('h-48');
      expect(cover).toHaveAttribute('data-sizes', '12rem');
    });
  });
});
