import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Mail } from 'lucide-react';
import { PasswordField } from '../password-field';
import { TextField } from '../text-field';
import { GoogleSignInSection } from '../google-sign-in-section';
import { PasswordRequirements } from '../password-requirements';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth store
const mockSignInWithGoogle = vi.fn();
vi.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      signInWithGoogle: mockSignInWithGoogle,
      loading: false,
    };
    return selector ? selector(state) : state;
  },
}));

describe('Auth components', () => {
  describe('TextField', () => {
    it('renders with label and icon', () => {
      const onChange = vi.fn();
      render(
        <TextField
          id="email"
          label="Email Address"
          value=""
          onChange={onChange}
          placeholder="email@example.com"
          icon={Mail}
        />
      );

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    });
  });

  describe('PasswordField', () => {
    it('toggles password visibility state', () => {
      const onChange = vi.fn();
      render(
        <PasswordField
          id="password"
          label="Password Label"
          value="secret123"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password Label');
      expect(input).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      fireEvent.click(toggleButton);

      expect(input).toHaveAttribute('type', 'text');

      const toggleButtonHide = screen.getByRole('button', { name: /hide password/i });
      fireEvent.click(toggleButtonHide);

      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders right label if provided', () => {
      render(
        <PasswordField
          id="password"
          label="Password"
          value=""
          onChange={vi.fn()}
          rightLabel={<span data-testid="forgot">Forgot?</span>}
        />
      );

      expect(screen.getByTestId('forgot')).toBeInTheDocument();
    });

    it('passes the autocomplete purpose to the password input', () => {
      render(
        <PasswordField
          label="Password"
          value=""
          onChange={vi.fn()}
          autoComplete="current-password"
        />
      );

      expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('PasswordRequirements', () => {
    it('does not render if passwordResult is null', () => {
      const { container } = render(<PasswordRequirements passwordResult={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders checklist status', () => {
      const dummyResult = {
        isValid: false,
        rules: {
          length: { passed: true },
          uppercase: { passed: false },
          lowercase: { passed: true },
          number: { passed: false },
          symbol: { passed: false },
        },
        unmetRules: ['uppercase', 'number', 'symbol'],
      };

      render(<PasswordRequirements passwordResult={dummyResult as any} />);

      expect(screen.getAllByText('✓')).toHaveLength(2);
      expect(screen.getAllByText('✗')).toHaveLength(3);
    });
  });

  describe('GoogleSignInSection', () => {
    it('renders Google sign-in button', () => {
      render(<GoogleSignInSection onError={vi.fn()} />);
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
      expect(screen.getByTestId('google-icon')).toBeInTheDocument();
    });

    it('triggers google sign in store call on click', async () => {
      mockSignInWithGoogle.mockResolvedValue(undefined);
      render(<GoogleSignInSection onError={vi.fn()} />);

      const button = screen.getByRole('button', { name: /sign in with google/i });
      fireEvent.click(button);

      await expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
});
