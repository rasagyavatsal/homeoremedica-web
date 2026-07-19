import { render, screen } from '@testing-library/react';
import { Footer } from '../footer';
import { describe, it, expect, vi } from 'vitest';

describe('Footer', () => {
  it('renders a compact brand-only lockup without finder descriptor copy', () => {
    const { container } = render(<Footer />);
    expect(screen.getByText('HomeoRemedica')).toBeDefined();
    expect(screen.queryByText(/homeopathic remedy finder/i)).toBeNull();
    expect(
      screen.queryByText(
        'Search symptoms across classical sources and compare homeopathic remedy matches.',
      ),
    ).toBeNull();
    expect(
      screen.queryByText(
        'Educational reference compiled from classical materia medica. Not medical advice, diagnosis, or treatment.',
      ),
    ).toBeNull();
    expect(container.querySelector('.rule-hairline')).toBeNull();
  });

  it('renders footer navigation links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Find Remedy' })).toBeDefined();
    expect(screen.queryByRole('link', { name: 'Remedies' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Android App' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeDefined();
    expect(screen.queryByText('Product')).toBeNull();
    expect(screen.queryByText('Utility')).toBeNull();
    expect(screen.queryByText('Reference')).toBeNull();
  });

  it('renders the copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} HomeoRemedica`, 'i'))).toBeDefined();
  });

  it('renders the version number if NEXT_PUBLIC_APP_VERSION is set', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '3.14.0');
    render(<Footer />);
    expect(screen.getByText(/v3.14.0/i)).toBeDefined();
    vi.unstubAllEnvs();
  });

  it('does not render version number if NEXT_PUBLIC_APP_VERSION is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '');
    render(<Footer />);
    // Use a regex that specifically looks for 'v' followed by a number, or just check for a specific version format
    expect(screen.queryByText(/^v\d+\.\d+\.\d+$/)).toBeNull();
    vi.unstubAllEnvs();
  });
  it('uses tokenized touch sizing and spacing for footer links', () => {
    render(<Footer />);
    const findRemedyLink = screen.getByRole('link', { name: 'Find Remedy' });
    
    expect(findRemedyLink.className).toContain('min-h-touch');
    expect(findRemedyLink.className).toContain('px-1.5');
    // Should offset the padding to maintain layout alignment
    expect(findRemedyLink.className).toContain('-mx-1.5');
    expect(findRemedyLink.className).toContain('focus-visible:outline-none');
  });
});
