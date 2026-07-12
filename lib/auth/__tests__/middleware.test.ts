import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
  },
  adminDb: {},
  adminSdk: {},
}));

import { verifyAuthToken, requireAuth, createAuthError } from '../middleware';

function createMockRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  if (authHeader) {
    headers.set('authorization', authHeader);
  }
  return new NextRequest('http://localhost:3000/api/test', { headers });
}

describe('verifyAuthToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for missing authorization header', async () => {
    const request = createMockRequest();
    const result = await verifyAuthToken(request);
    expect(result).toBeNull();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('returns null for malformed header (no Bearer prefix)', async () => {
    const request = createMockRequest('Token abc123');
    const result = await verifyAuthToken(request);
    expect(result).toBeNull();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('returns null for empty Bearer token', async () => {
    const request = createMockRequest('Bearer ');
    // Firebase will reject empty string
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    const result = await verifyAuthToken(request);
    expect(result).toBeNull();
  });

  it('returns user for valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'test@example.com',
    });

    const request = createMockRequest('Bearer valid-token');
    const result = await verifyAuthToken(request);

    expect(result).toEqual({
      uid: 'user-123',
      email: 'test@example.com',
    });
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
  });

  it('returns null when verifyIdToken throws', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));

    const request = createMockRequest('Bearer expired-token');
    const result = await verifyAuthToken(request);
    expect(result).toBeNull();
  });

  it('returns empty email string when decoded token has no email', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'user-no-email',
    });

    const request = createMockRequest('Bearer valid-token');
    const result = await verifyAuthToken(request);
    expect(result).toEqual({
      uid: 'user-no-email',
      email: '',
    });
  });
});

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws AUTH_REQUIRED error when token is invalid', async () => {
    const request = createMockRequest();

    try {
      await requireAuth(request);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe('AUTH_REQUIRED');
      expect(error.message).toContain('Authentication required');
    }
  });

  it('returns user object on success', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'user-456',
      email: 'success@example.com',
    });

    const request = createMockRequest('Bearer valid-token');
    const user = await requireAuth(request);

    expect(user).toEqual({
      uid: 'user-456',
      email: 'success@example.com',
    });
  });
});

describe('createAuthError', () => {
  it('returns AUTH_REQUIRED error shape', () => {
    const error = createAuthError();
    expect(error.code).toBe('AUTH_REQUIRED');
    expect(error.message).toBeTruthy();
  });
});
