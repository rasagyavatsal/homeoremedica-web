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
        name: 'Homeopathic Remedy Finder for Doctors',
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
    expect(
      screen.getByText('Search by symptom. Choose the closest matches. Compare the remedies.'),
    ).toBeInTheDocument();

    const hero = screen.getByRole('heading', { level: 1 }).parentElement;
    expect(hero).toHaveClass('text-center');
    const remedyPreview = screen.getByRole('region', { name: 'Remedy finder demonstration' });
    const referenceDisclaimer = screen.getByText(
      'Results are a reference for study and practitioner research, not medical diagnosis or treatment advice.',
    );
    const classicalSources = screen.getByRole('region', { name: 'Classical sources' });

    expect(remedyPreview).toHaveClass('preview-device');
    expect(remedyPreview.compareDocumentPosition(referenceDisclaimer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(referenceDisclaimer.compareDocumentPosition(classicalSources)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(referenceDisclaimer).toHaveClass('mx-auto', 'text-center');
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
    expect(heading).toHaveAccessibleName('Homeopathic Remedy Finder for Practitioners');

    act(() => vi.advanceTimersByTime(3_000));
    expect(heading).toHaveAccessibleName('Homeopathic Remedy Finder for Students');

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
      expect(cover).toHaveClass('w-36', 'object-cover');
      expect(cover).not.toHaveClass('grayscale', 'opacity-80');
      expect(cover).toHaveAttribute('data-sizes', '9rem');
    });
  });

  it('explains keyword searching between the hero and classical sources', () => {
    render(<HomePage />);

    const howToSearch = screen.getByRole('region', {
      name: 'How it works',
    });
    const classicalSources = screen.getByRole('region', { name: 'Classical sources' });
    const heroHeading = screen.getByRole('heading', { level: 1 });

    expect(howToSearch).toContainElement(
      screen.getByRole('heading', { level: 2, name: 'How it works' }),
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'How it works' });
    const supportingCopy = screen.getByText('Type only keywords, not full sentences.');

    expect(heading.nextElementSibling).toBe(supportingCopy);
    expect(heading.parentElement).not.toHaveClass('grid');
    expect(howToSearch).toHaveClass('border-y');
    expect(heading).not.toHaveClass('max-w-2xl');
    expect(supportingCopy).toHaveClass('mt-5');
    expect(howToSearch).toHaveTextContent('itching at night in bed');
    expect(howToSearch).toHaveTextContent('itching bed night');
    expect(howToSearch).toHaveTextContent('pain in the molar tooth aggravated by touching the cheek');
    expect(howToSearch).toHaveTextContent('toothache cheeks');
    expect(howToSearch).toHaveTextContent('Order doesn’t matter');
    expect(howToSearch).toHaveTextContent('Select every close match');
    expect(howToSearch).toHaveTextContent('Choose all similar symptoms from the results.');
    expect(howToSearch).not.toHaveTextContent('to build the full picture');
    expect(howToSearch).toHaveTextContent('Break complex symptoms apart');
    expect(heroHeading.compareDocumentPosition(howToSearch)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(howToSearch.compareDocumentPosition(classicalSources)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('replaces the generic closing callout with a saved-cases section', () => {
    render(<HomePage />);

    const casesSection = screen.getByRole('region', { name: 'Saved cases' });

    expect(casesSection).toContainElement(
      screen.getByRole('heading', { level: 2, name: 'Save cases. Pick up where you left off.' }),
    );
    expect(casesSection).not.toHaveTextContent(
      'Save the source and selected symptoms together, then return to the case without rebuilding your research.',
    );
    expect(casesSection).toContainElement(screen.getByRole('region', { name: 'Saved cases preview' }));
    expect(casesSection).not.toContainElement(screen.getByText(/Results are a reference for study/));
    expect(screen.queryByText('Give the case your full attention.')).not.toBeInTheDocument();
    const casesPreview = screen.getByRole('region', { name: 'Saved cases preview' });
    const findRemedyLink = screen.getByRole('link', { name: 'Find Remedy' });

    expect(findRemedyLink).toHaveAttribute('href', '/find-remedy');
    expect(casesPreview.compareDocumentPosition(findRemedyLink)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(findRemedyLink.parentElement).toHaveClass('justify-center');
  });
});
