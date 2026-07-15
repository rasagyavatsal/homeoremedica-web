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

  it('renders the "Information We Collect" section', () => {
    render(<PrivacyClient />);
    const sectionTitle = screen.getByRole('heading', { name: 'Information We Collect' });
    expect(sectionTitle).toBeInTheDocument();
    expect(sectionTitle.tagName).toBe('H2');
  });

  it('renders the last updated date', () => {
    render(<PrivacyClient />);
    const lastUpdated = screen.getByText(/Last updated: January 21, 2025/i);
    expect(lastUpdated).toBeInTheDocument();
  });

  it('renders the medical disclaimer', () => {
    render(<PrivacyClient />);
    const disclaimer = screen.getByText(/HomeoRemedica is an educational tool/i);
    expect(disclaimer).toBeInTheDocument();
  });
});
