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
  it('introduces the product and sends the primary action to the chat', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Homeopathic Remedy Finder for Doctors',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open chat' })[0]).toHaveAttribute(
      'href',
      '/chat',
    );
    expect(screen.getByRole('link', { name: 'Android app' })).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=com.rasagyavatsal.homeoremedica',
    );
    expect(screen.queryByRole('link', { name: 'See how it works' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Classical sources' })).toBeInTheDocument();
    expect(screen.queryByTestId('symptom-search')).not.toBeInTheDocument();
    expect(
      screen.getByText('Ask about a remedy or symptom. Every answer cites the passages it comes from.'),
    ).toBeInTheDocument();

    const hero = screen.getByRole('heading', { level: 1 }).parentElement!;
    expect(hero).toHaveClass('text-center');
    const classicalSources = screen.getByRole('region', { name: 'Classical sources' });

    expect(screen.queryByRole('region', { name: 'Remedy finder demonstration' })).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Results are a reference for study and practitioner research, not medical diagnosis or treatment advice.',
      ),
    ).not.toBeInTheDocument();
    expect(hero.compareDocumentPosition(classicalSources)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
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
      name: 'Four books. Every answer cited.',
    });
    const booksCopy = screen.getByText(
      'Each answer is grounded in passages from these books, listed under the answer with their book, remedy, and section. The books use different wording, so the same question can surface different voices.',
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

  it('shows example questions between the hero and classical sources', () => {
    render(<HomePage />);

    const howToAsk = screen.getByRole('region', {
      name: 'How it works',
    });
    const classicalSources = screen.getByRole('region', { name: 'Classical sources' });
    const heroHeading = screen.getByRole('heading', { level: 1 });

    const heading = screen.getByRole('heading', { level: 2, name: 'How it works' });
    const supportingCopy = screen.getByText(
      'Ask in plain language. Full sentences work here.',
    );

    expect(howToAsk).toContainElement(heading);
    expect(heading.nextElementSibling).toBe(supportingCopy);
    expect(heading.parentElement).not.toHaveClass('grid');
    expect(howToAsk).toHaveClass('border-y');
    expect(supportingCopy).toHaveClass('mt-5');
    expect(howToAsk).toHaveTextContent('How does Kent describe the temper of Nux vomica?');
    expect(howToAsk).toHaveTextContent('Which remedies does Clarke list for sleeplessness?');
    expect(screen.getAllByText(/^Example 0[12]$/)).toHaveLength(2);
    expect(howToAsk).toHaveTextContent(
      'Answers draw only from the four source books and cite the passages used.',
    );
    expect(howToAsk).toHaveTextContent(
      'Follow-up questions keep the thread, so a remedy can be narrowed step by step.',
    );
    expect(howToAsk).toHaveTextContent(
      'The books are historical reference, not medical advice.',
    );
    expect(howToAsk).not.toHaveTextContent('Search words');
    expect(howToAsk).not.toHaveTextContent('itching bed night');
    expect(heroHeading.compareDocumentPosition(howToAsk)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(howToAsk.compareDocumentPosition(classicalSources)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('ends the classical sources with a chat call to action', () => {
    render(<HomePage />);

    expect(screen.queryByRole('region', { name: 'Saved cases' })).not.toBeInTheDocument();
    const chatLinks = screen.getAllByRole('link', { name: 'Open chat' });

    expect(chatLinks).toHaveLength(2);
    chatLinks.forEach((link) => expect(link).toHaveAttribute('href', '/chat'));
    expect(chatLinks[1].parentElement).toHaveClass('justify-center');
  });
});
