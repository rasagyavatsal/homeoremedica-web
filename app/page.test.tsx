import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HomePage from './page';
import { FIND_REMEDY_FAQ_ITEMS } from '@/lib/seo/find-remedy-content';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock('@/components/unified-symptom-search', () => ({
  UnifiedSymptomSearch: () => <div data-testid="symptom-search">Symptom Search</div>,
}));

vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

vi.mock('@/lib/hooks/use-user-cases', () => ({
  useUserCases: () => ({ loading: false }),
}));

describe('HomePage structured data', () => {
  it('renders FAQPage JSON-LD from the same FAQ copy shown on the page', () => {
    const { container } = render(<HomePage />);

    const faqRegion = screen.getByRole('region', { name: 'Find remedy features' });
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();

    const jsonLd = JSON.parse(script!.innerHTML);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(FIND_REMEDY_FAQ_ITEMS.length);

    FIND_REMEDY_FAQ_ITEMS.forEach((faq) => {
      expect(within(faqRegion).getByRole('heading', { name: faq.question })).toBeInTheDocument();
      expect(within(faqRegion).getByText(faq.answer)).toBeInTheDocument();
      expect(jsonLd.mainEntity).toContainEqual({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      });
    });

    expect(within(faqRegion).queryByText(/^Remedies$/)).toBeNull();
    expect(within(faqRegion).queryByText(/^Indications$/)).toBeNull();
    expect(within(faqRegion).queryByText(/^Sources$/)).toBeNull();
  });
});
