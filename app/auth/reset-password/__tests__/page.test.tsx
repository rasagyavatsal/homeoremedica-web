import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/auth/reset-password',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock firebase auth
const mockSendPasswordReset = vi.fn();
vi.mock('@/lib/auth/firebase-auth', () => ({
  sendPasswordReset: (...args: any[]) => mockSendPasswordReset(...args),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowLeft: (props: any) => <span data-testid="arrow-left-icon" {...props} />,
  CheckCircle: (props: any) => <span data-testid="check-circle-icon" {...props} />,
  Mail: (props: any) => <span data-testid="mail-icon" {...props} />,
}));

import ResetPasswordPage from '../page';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input and submit button', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument();
  });

  it('does not render a redundant form description', () => {
    render(<ResetPasswordPage />);
    expect(screen.queryByText(/Enter your email address/i)).not.toBeInTheDocument();
  });

  it('renders Back to Login link with correct href', () => {
    render(<ResetPasswordPage />);
    const links = screen.getAllByRole('link', { name: /Back to Login/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/auth/login');
  });

  it('renders a concise success message upon successful form submission', async () => {
    mockSendPasswordReset.mockResolvedValueOnce({});
    render(<ResetPasswordPage />);
    
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    
    await waitFor(() => {
      // It should still render the callout
      expect(screen.getByText(/If you do not see it, check your spam folder/)).toBeInTheDocument();
      // It should render the exact success description
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Reset link sent to test@example.com.';
      })).toBeInTheDocument();
      // It should NOT render the old descriptive text
      expect(screen.queryByText(/We've sent a password reset link to/i)).not.toBeInTheDocument();
    });
  });
});
