import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrivacyClient } from '../privacy-client';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('PrivacyClient', () => {
  it('renders the privacy policy title', () => {
    render(<PrivacyClient />);
    const title = screen.getByText('Privacy Policy');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
  });

  it('does not render a non-auth page eyebrow above the title', () => {
    render(<PrivacyClient />);

    expect(screen.queryByText('Utility policy')).not.toBeInTheDocument();
    expect(screen.queryByText('Your information')).not.toBeInTheDocument();
  });

  it('renders the information processing section', () => {
    render(<PrivacyClient />);
    const sectionTitle = screen.getByRole('heading', { name: 'Information We Process' });
    expect(sectionTitle).toBeInTheDocument();
    expect(sectionTitle.tagName).toBe('H2');
  });

  it('renders the last updated date', () => {
    render(<PrivacyClient />);
    const lastUpdated = screen.getByText(/Last updated: July 19, 2026/i);
    expect(lastUpdated).toBeInTheDocument();
  });

  it('covers the website, API, and Android app', () => {
    render(<PrivacyClient />);
    expect(screen.getByText(/website, server API, and Android app/i)).toBeInTheDocument();
  });

  it('provides account deletion instructions', () => {
    render(<PrivacyClient />);
    expect(screen.getByText(/Delete HomeoRemedica account/i)).toBeInTheDocument();
  });
});
