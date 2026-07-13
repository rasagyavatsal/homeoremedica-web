import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthRedirect } from '../use-auth-redirect';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockAuthUser = { current: null as any };
vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockAuthUser.current,
  }),
}));

const mockLoading = { current: false };
vi.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    const state = { loading: mockLoading.current };
    return selector ? selector(state) : state;
  },
}));

describe('useAuthRedirect', () => {
  it('does not redirect if user is not authenticated', () => {
    mockAuthUser.current = null;
    mockLoading.current = false;
    mockReplace.mockClear();

    renderHook(() => useAuthRedirect());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect if loading is true', () => {
    mockAuthUser.current = { uid: '123' };
    mockLoading.current = true;
    mockReplace.mockClear();

    renderHook(() => useAuthRedirect());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to the finder if user is authenticated and not loading', () => {
    mockAuthUser.current = { uid: '123' };
    mockLoading.current = false;
    mockReplace.mockClear();

    renderHook(() => useAuthRedirect());

    expect(mockReplace).toHaveBeenCalledWith('/find-remedy');
  });
});
