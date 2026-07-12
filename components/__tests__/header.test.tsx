import { render, screen } from '@testing-library/react';
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

  it('uses consistent h-9 sizing for header actions and controls', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );

    // Nav links should have min-h-9, not min-h-10
    const findRemedyLinks = screen.getAllByRole('link', { name: /find remedy/i });
    expect(findRemedyLinks[0].className).toContain('min-h-9');

    // Theme toggle should have h-9 w-9, not h-10 w-10
    const themeToggle = screen.getByRole('button', { name: /switch to/i });
    expect(themeToggle.className).toContain('h-9');
    expect(themeToggle.className).toContain('w-9');

    // Android App should have h-9 (via size="sm")
    const androidApp = screen.getAllByRole('link', { name: /android app/i });
    expect(androidApp[0].className).toContain('h-9');

    // Sign in should have h-9
    const signIn = screen.getAllByRole('link', { name: /sign in/i });
    expect(signIn[0].className).toContain('h-9');

    // Menu trigger should have h-9 w-9
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton.className).toContain('h-9');
    expect(menuButton.className).toContain('w-9');
  });
});
