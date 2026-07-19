import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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
  usePathname: () => '/auth/signup',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth store
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
vi.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      signUp: mockSignUp,
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

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Eye: (props: any) => <span data-testid="eye-icon" {...props} />,
  EyeOff: (props: any) => <span data-testid="eye-off-icon" {...props} />,
  Mail: (props: any) => <span data-testid="mail-icon" {...props} />,
  Lock: (props: any) => <span data-testid="lock-icon" {...props} />,
  User: (props: any) => <span data-testid="user-icon" {...props} />,
  AlertCircle: (props: any) => <span data-testid="alert-circle-icon" {...props} />,
}));

import SignupPage from '../page';

describe('SignupPage Header Copy Cleanup (Issue #43)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser.current = null;
    mockAuthLoading.current = false;
  });

  it('does not render redundant intro copy', () => {
    render(<SignupPage />);
    expect(screen.queryByText('Create an account to save cases.')).not.toBeInTheDocument();
  });

  it('renders concise card description', () => {
    render(<SignupPage />);
    expect(screen.getByText('Save cases across devices.')).toBeInTheDocument();
    expect(screen.queryByText('Create your account to save your cases.')).not.toBeInTheDocument();
  });

  it('links to the terms and privacy policy', () => {
    render(<SignupPage />);

    expect(screen.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute(
      'href',
      '/terms',
    );
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });
});

describe('SignupPage Strict Password Rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser.current = null;
    mockAuthLoading.current = false;
  });

  const fillForm = (password: string) => {
    const nameInput = screen.getByLabelText(/Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.change(confirmInput, { target: { value: password } });
  };

  it('updates placeholder text to "Min 12 characters"', () => {
    render(<SignupPage />);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute('placeholder', 'Min 12 characters');
  });

  it('shows real-time checklist when password has content and hides when empty', () => {
    render(<SignupPage />);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    
    expect(screen.queryByText('At least 12 characters')).not.toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'a' } });
    expect(screen.getByText('At least 12 characters')).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: '' } });
    expect(screen.queryByText('At least 12 characters')).not.toBeInTheDocument();
  });

  it('rejects password with under 12 characters', async () => {
    render(<SignupPage />);
    fillForm('Short1!a');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Password does not meet requirements/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('rejects password missing uppercase letter', async () => {
    render(<SignupPage />);
    fillForm('longpassword1!');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Password does not meet requirements:.*One uppercase letter/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('rejects password missing lowercase letter', async () => {
    render(<SignupPage />);
    fillForm('LONGPASSWORD1!');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Password does not meet requirements:.*One lowercase letter/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('rejects password missing number', async () => {
    render(<SignupPage />);
    fillForm('LongPassword!');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Password does not meet requirements:.*One number/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('rejects password missing symbol', async () => {
    render(<SignupPage />);
    fillForm('LongPassword1');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Password does not meet requirements:.*One symbol/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('submits successfully with valid password meeting all rules', async () => {
    render(<SignupPage />);
    fillForm('MySecure123!@');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    expect(screen.queryByText(/Password does not meet requirements/i)).not.toBeInTheDocument();
    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'MySecure123!@', 'Test User');
  });
});
