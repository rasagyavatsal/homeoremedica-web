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

  it('introduces each classical source with its character and use', () => {
    render(<HomePage />);

    expect(screen.queryByText('Less interface. More attention.')).not.toBeInTheDocument();
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    const booksHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Four books. One place to search.',
    });
    const booksCopy = screen.getByText(
      'Choose a book before you search. The results will only include symptoms and remedies from that book. Each book uses different wording. If a search does not return a useful result, try the same symptom in another book.',
    );

    expect(booksHeading.nextElementSibling).toBe(booksCopy);
    expect(booksHeading.parentElement).not.toHaveClass('grid');
    expect(booksCopy).toHaveClass('mt-5');

    [
      'Clarke set out to make this a complete dictionary rather than another abridged materia medica. It includes every remedy he could trace to recorded homoeopathic use.',
      'Boericke wrote this as a compact reference for everyday use. It summarises characteristic symptoms and points readers to larger works for further study.',
      'These chapters began as lectures for postgraduate students. Kent kept the conversational style to make the character of each remedy easier to grasp.',
      'Allen devoted this book to the nosodes. It brings together material he had studied and revised over many years.',
    ].forEach((description) => expect(screen.getByText(description)).toBeInTheDocument());

    const sourceGrid = screen
      .getByRole('heading', {
        level: 3,
        name: (name) => name.startsWith('A DICTIONARY OF PRACTICAL'),
      })
      .closest('article')
      ?.parentElement;
    expect(sourceGrid).toHaveClass('lg:grid-cols-2');

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
    const supportingCopy = screen.getByText(
      'Use a few distinct keywords rather than a full sentence.',
    );

    expect(heading.nextElementSibling).toBe(supportingCopy);
    expect(heading.parentElement).not.toHaveClass('grid');
    expect(howToSearch).toHaveClass('border-y');
    expect(heading).not.toHaveClass('max-w-2xl');
    expect(supportingCopy).toHaveClass('mt-5');
    expect(howToSearch).toHaveTextContent('itching at night in bed');
    expect(howToSearch).toHaveTextContent('itching bed night');
    expect(howToSearch).toHaveTextContent('pain in the molar tooth aggravated by touching the cheek');
    expect(howToSearch).toHaveTextContent('toothache cheeks');
    expect(screen.getAllByText('Full sentence')).toHaveLength(2);
    expect(screen.getAllByText('Search words')).toHaveLength(2);
    expect(howToSearch).toHaveTextContent(
      'The order of the words is not important. Type them in whichever order they come to mind.',
    );
    expect(howToSearch).toHaveTextContent(
      'A book may describe the same symptom in more than one way. Select each result that matches what you mean.',
    );
    expect(howToSearch).toHaveTextContent(
      'If a symptom does not appear, break it into smaller symptoms and search them separately.',
    );
    expect(howToSearch).not.toHaveTextContent('Order doesn’t matter');
    expect(howToSearch).not.toHaveTextContent('Select every close match');
    expect(howToSearch).not.toHaveTextContent('Break complex symptoms apart');
    expect(heroHeading.compareDocumentPosition(howToSearch)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(howToSearch.compareDocumentPosition(classicalSources)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('replaces the generic closing callout with a saved-cases section', () => {
    render(<HomePage />);

    const casesSection = screen.getByRole('region', { name: 'Saved cases' });

    const casesHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Save cases. Pick up where you left off.',
    });
    const casesCopy = casesHeading.nextElementSibling;

    expect(casesSection).toContainElement(casesHeading);
    expect(casesHeading.parentElement).not.toHaveClass('grid');
    expect(casesCopy).toHaveClass('mt-5');
    expect(casesCopy).toHaveTextContent(
      'Select the symptoms you want to keep, give the case a name, and save it.',
    );
    expect(casesSection).toHaveTextContent(
      'Select the symptoms you want to keep, give the case a name, and save it. You can open it again from Saved cases.',
    );
    expect(casesSection).not.toHaveTextContent('Save the working set');
    expect(casesSection).not.toHaveTextContent('Review the record');
    expect(casesSection).not.toHaveTextContent('Resume with context');
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
