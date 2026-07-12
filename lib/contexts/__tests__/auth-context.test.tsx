import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import type { FirebaseUser } from '@/lib/auth/firebase-auth';

// Track store state and allow external mutation
const authListenerCleanup = () => undefined;

const storeState = {
  user: null as FirebaseUser | null,
  loading: false,
  initialized: false,
  initializeAuthListener: vi.fn().mockReturnValue(authListenerCleanup),
};

vi.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: <T,>(selector: (state: typeof storeState) => T) => selector(storeState),
}));

vi.mock('@/lib/auth/firebase-auth', () => ({
  FirebaseUser: {},
}));

import { AuthProvider, useAuth } from '../auth-context';

function TestConsumer() {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="loading">{String(loading)}</span>
    </div>
  );
}

function BadConsumer() {
  useAuth();
  return null;
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeState.user = null;
    storeState.loading = false;
    storeState.initialized = false;
    storeState.initializeAuthListener = vi.fn().mockReturnValue(authListenerCleanup);
  });

  it('provides null user initially', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('updates user when store changes and initialized is true', async () => {
    storeState.user = { uid: 'u1', email: 'test@test.com', displayName: 'Test' };
    storeState.initialized = true;

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@test.com');
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('calls initializeAuthListener on mount', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(storeState.initializeAuthListener).toHaveBeenCalledTimes(1);
  });

  it('useAuth returns default outside provider without logging', () => {
    // Suppress React error boundary output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // useAuth checks for context but the default context is defined (not undefined),
    // so it returns the default { user: null, loading: true, token: null }.
    // This is the actual behavior of the component — the context has a default value.
    render(<BadConsumer />);

    // The default context is provided, so it doesn't throw and React logs no error.
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('sets user to null when store user becomes null after initialization', async () => {
    storeState.user = { uid: 'u1', email: 'a@b.com', displayName: 'A' };
    storeState.initialized = true;

    const { rerender } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    });

    // Simulate user logout
    act(() => {
      storeState.user = null;
    });

    rerender(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });
});
