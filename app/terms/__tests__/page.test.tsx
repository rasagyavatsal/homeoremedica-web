import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TermsClient } from '../terms-client';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('TermsClient', () => {
  it('renders the terms title and update date', () => {
    render(<TermsClient />);

    expect(screen.getByRole('heading', { level: 1, name: 'Terms and Conditions' })).toBeInTheDocument();
    expect(screen.getByText(/Last updated: July 19, 2026/i)).toBeInTheDocument();
  });

  it('applies to the website, API, and Android app', () => {
    render(<TermsClient />);

    expect(screen.getByText(/website, server API, and Android app/i)).toBeInTheDocument();
  });

  it('states the required health limitations', () => {
    render(<TermsClient />);

    expect(screen.getByText(/not a medical device/i)).toBeInTheDocument();
    expect(screen.getByText(/does not diagnose, treat, cure, or prevent/i)).toBeInTheDocument();
    expect(screen.getByText(/consult a qualified healthcare professional/i)).toBeInTheDocument();
  });

  it('links to the privacy policy and contact page', () => {
    render(<TermsClient />);

    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Contact Page' })).toHaveAttribute('href', '/contact');
  });
});
