import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockPush = vi.fn();
const mockChangePassword = vi.fn();
const mockUserState = {
  current: { uid: 'user-1', email: 'user@example.com', displayName: 'John Doe' } as any,
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockUserState.current,
    loading: false,
  }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      changePassword: mockChangePassword,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock('@/lib/auth/firebase-auth', () => ({
  isGoogleUser: () => false,
  signOutUser: vi.fn(),
}));

import SettingsPage from '../page';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserState.current = { uid: 'user-1', email: 'user@example.com', displayName: 'John Doe' };
  });

  it('renders settings heading without redundant subcopy and security card description', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByText('Manage your account security and preferences.')).not.toBeInTheDocument();
    expect(screen.queryByText('Update your password to keep the account current.')).not.toBeInTheDocument();
    expect(screen.getByText('Change password')).toBeInTheDocument();
    expect(screen.queryByText('Security')).not.toBeInTheDocument();
  });

  it('Placeholder shows "Min 12 characters" and FieldHint shows updated text', () => {
    render(<SettingsPage />);
    
    expect(screen.getByPlaceholderText('Min 12 characters')).toBeInTheDocument();
    expect(screen.getByText('Min 12 characters with mixed case, numbers, and symbols.')).toBeInTheDocument();
  });

  it('Real-time checklist renders when new password has content and hides when empty', () => {
    render(<SettingsPage />);
    
    expect(screen.queryByText('At least 12 characters')).not.toBeInTheDocument();
    
    const newPasswordInput = screen.getByLabelText(/^New password/i);
    fireEvent.change(newPasswordInput, { target: { value: 'A' } });
    
    expect(screen.getByText('At least 12 characters')).toBeInTheDocument();
    
    fireEvent.change(newPasswordInput, { target: { value: '' } });
    expect(screen.queryByText('At least 12 characters')).not.toBeInTheDocument();
  });

  it('Checklist updates in real-time as user types', () => {
    render(<SettingsPage />);
    
    const newPasswordInput = screen.getByLabelText(/^New password/i);
    fireEvent.change(newPasswordInput, { target: { value: 'a' } });
    
    let lowercaseCheck = screen.getByText('Lowercase letter (a-z)').previousSibling;
    let uppercaseCheck = screen.getByText('Uppercase letter (A-Z)').previousSibling;
    expect(lowercaseCheck).toHaveTextContent('✓');
    expect(uppercaseCheck).toHaveTextContent('✗');
    
    fireEvent.change(newPasswordInput, { target: { value: 'aA' } });
    uppercaseCheck = screen.getByText('Uppercase letter (A-Z)').previousSibling;
    expect(uppercaseCheck).toHaveTextContent('✓');
  });

  it('Form submits successfully with valid new password meeting all rules', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'ValidPass123!@#' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'ValidPass123!@#' } });
    
    mockChangePassword.mockResolvedValueOnce(undefined);
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('OldPass123!', 'ValidPass123!@#');
    });
  });

  it('Form rejects new password with only 11 characters', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Valid123!@#' } }); // 11 chars
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Valid123!@#' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Password does not meet requirements.*At least 12 characters/i)).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('Form rejects new password without uppercase letter', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'validpass123!@#' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'validpass123!@#' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Password does not meet requirements.*One uppercase letter/i)).toBeInTheDocument();
  });

  it('Form rejects new password without lowercase letter', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'VALIDPASS123!@#' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'VALIDPASS123!@#' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Password does not meet requirements.*One lowercase letter/i)).toBeInTheDocument();
  });

  it('Form rejects new password without number', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'ValidPassword!@#' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'ValidPassword!@#' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Password does not meet requirements.*One number/i)).toBeInTheDocument();
  });

  it('Form rejects new password without symbol', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'ValidPassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'ValidPassword123' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Password does not meet requirements.*One symbol/i)).toBeInTheDocument();
  });

  it('Form rejects new password same as current password', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'ValidPass123!@#' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'ValidPass123!@#' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'ValidPass123!@#' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Password does not meet requirements.*New password must be different from current password/i)).toBeInTheDocument();
  });

  it('Form rejects new password containing email prefix', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'userValid123!@#' } }); // 'user' is the email prefix
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'userValid123!@#' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Password does not meet requirements.*personal information/i)).toBeInTheDocument();
  });
  
  it('Error message lists specific unmet rules', async () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'valid12' } }); // Missing length, uppercase, symbol
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'valid12' } });
    
    const submitButton = screen.getByRole('button', { name: /Update password/i });
    fireEvent.click(submitButton);
    
    const errorMessage = await screen.findByText(/Password does not meet requirements/i);
    expect(errorMessage).toHaveTextContent('At least 12 characters');
    expect(errorMessage).toHaveTextContent('One uppercase letter');
    expect(errorMessage).toHaveTextContent('One symbol');
  });
});

