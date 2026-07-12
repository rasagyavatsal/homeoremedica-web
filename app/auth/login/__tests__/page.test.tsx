import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation (already in vitest.setup.ts but we need to capture push/replace)
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/auth/login',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth store
const mockSignIn = vi.fn();
const mockSignInWithGoogle = vi.fn();
vi.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      loading: false,
    };
    return selector ? selector(state) : state;
  },
}));

// Mock auth context
const mockAuthUser = { current: null as any };
const mockAuthLoading = { current: false };
vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockAuthUser.current,
    loading: mockAuthLoading.current,
    token: null,
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img alt="" {...props} />,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Eye: (props: any) => <span data-testid="eye-icon" {...props} />,
  EyeOff: (props: any) => <span data-testid="eye-off-icon" {...props} />,
  Mail: (props: any) => <span data-testid="mail-icon" {...props} />,
  Lock: (props: any) => <span data-testid="lock-icon" {...props} />,
  Chrome: (props: any) => <span data-testid="chrome-icon" {...props} />,
  Search: (props: any) => <span data-testid="search-icon" {...props} />,
  Database: (props: any) => <span data-testid="database-icon" {...props} />,
  BookOpen: (props: any) => <span data-testid="book-icon" {...props} />,
  AlertCircle: (props: any) => <span data-testid="alert-icon" {...props} />,
}));

import LoginPage from '../page';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser.current = null;
    mockAuthLoading.current = false;
  });

  it('renders email and password inputs', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders Google sign-in button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
  });

  it('shows error message on failed sign-in', async () => {
    const error = new Error('Invalid credentials');
    (error as any).code = 'auth/invalid-credential';
    mockSignIn.mockRejectedValue(error);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument();
    });
  });

  it('redirects authenticated user to home page', async () => {
    mockAuthUser.current = { uid: 'u1', email: 'test@test.com', displayName: 'Test' };

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('does not redirect while loading', () => {
    mockAuthLoading.current = true;
    mockAuthUser.current = null;

    render(<LoginPage />);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('calls signIn with email and password on submit', async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'mypassword');
    });
  });

  it('shows link to sign up page', () => {
    render(<LoginPage />);

    const signupLink = screen.getByText('Sign up free');
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/auth/signup');
  });

  it('does not render redundant helper descriptions', () => {
    render(<LoginPage />);
    expect(screen.queryByText('Sign in to continue.')).not.toBeInTheDocument();
    expect(screen.queryByText('Enter your credentials to continue.')).not.toBeInTheDocument();
  });
});
