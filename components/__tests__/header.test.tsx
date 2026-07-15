import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@/lib/contexts/theme-context';
import { Header } from '../header';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders the theme toggle in the top bar', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('renders a brand-only lockup without finder subtitle', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );

    expect(screen.getByText('HomeoRemedica')).toBeInTheDocument();
    expect(screen.queryByText(/homeopathic remedy finder/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /^remedies$/i })).toBeNull();
  });

  it('renders as a sticky header inside a contained surface', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );

    const header = screen.getByRole('banner');
    const shell = header.firstElementChild;
    const surface = shell?.firstElementChild;

    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-3');
    expect(shell).toHaveClass('page-shell');
    expect(surface).toHaveClass('overflow-hidden', 'rounded-xl', 'border');

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    expect(surface).toContainElement(screen.getByRole('navigation', { name: /primary mobile/i }));
  });

  it('uses named control and touch-target tokens for header actions', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );

    const findRemedyLinks = screen.getAllByRole('link', { name: /find remedy/i });
    expect(findRemedyLinks[0].className).toContain('min-h-touch');

    const themeToggle = screen.getByRole('button', { name: /switch to/i });
    expect(themeToggle.className).toContain('h-control-sm');
    expect(themeToggle.className).toContain('w-control-sm');

    const androidApp = screen.getAllByRole('link', { name: /android app/i });
    expect(androidApp[0].className).toContain('min-h-touch');

    const signIn = screen.getAllByRole('link', { name: /sign in/i });
    expect(signIn[0].className).toContain('min-h-touch');

    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton.className).toContain('h-control-sm');
    expect(menuButton.className).toContain('w-control-sm');
  });
});
