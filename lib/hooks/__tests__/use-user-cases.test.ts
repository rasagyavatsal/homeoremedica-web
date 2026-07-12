import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserCases } from '../use-user-cases';
import { useAuth } from '../../contexts/auth-context';
import { useCasesStore } from '../../stores/cases-store';
import React from 'react';

// Mock the dependencies
vi.mock('../../contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../stores/cases-store', () => ({
  useCasesStore: vi.fn(),
}));

describe('useUserCases hook', () => {
  let mockLoadUserCases: any;
  let mockClearCases: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadUserCases = vi.fn();
    mockClearCases = vi.fn();
    
    (useCasesStore as any).mockReturnValue({
      loadUserCases: mockLoadUserCases,
      clearCases: mockClearCases,
      loading: false,
    });
  });

  it('should load cases when user is present', () => {
    (useAuth as any).mockReturnValue({
      user: { uid: 'u1' },
    });

    renderHook(() => useUserCases());

    expect(mockLoadUserCases).toHaveBeenCalledWith('u1');
    expect(mockClearCases).not.toHaveBeenCalled();
  });

  it('should clear cases when user is null', () => {
    (useAuth as any).mockReturnValue({
      user: null,
    });

    renderHook(() => useUserCases());

    expect(mockClearCases).toHaveBeenCalled();
    expect(mockLoadUserCases).not.toHaveBeenCalled();
  });

  it('should return loading state from store', () => {
    (useAuth as any).mockReturnValue({
      user: null,
    });
    (useCasesStore as any).mockReturnValue({
      loadUserCases: mockLoadUserCases,
      clearCases: mockClearCases,
      loading: true,
    });

    const { result } = renderHook(() => useUserCases());
    expect(result.current.loading).toBe(true);
  });
});
