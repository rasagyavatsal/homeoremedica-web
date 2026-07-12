import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockRequireAuth, mockCreateOrUpdateUser } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateOrUpdateUser: vi.fn(),
}));

vi.mock('@/lib/auth/middleware', () => ({
  requireAuth: (...args: any[]) => mockRequireAuth(...args),
}));

vi.mock('@/lib/services/user-service', () => ({
  createOrUpdateUser: (...args: any[]) => mockCreateOrUpdateUser(...args),
}));

import { POST } from '../route';

function createRequest(body?: any): NextRequest {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  return new NextRequest('http://localhost:3000/api/auth/session', {
    method: 'POST',
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe('POST /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without valid auth token', async () => {
    mockRequireAuth.mockRejectedValue({
      code: 'AUTH_REQUIRED',
      message: 'Authentication required.',
    });

    const req = createRequest();
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.code).toBe('AUTH_REQUIRED');
  });

  it('calls createOrUpdateUser and returns user response', async () => {
    mockRequireAuth.mockResolvedValue({ uid: 'user-1', email: 'test@test.com' });
    mockCreateOrUpdateUser.mockResolvedValue({
      email: 'test@test.com',
      name: 'Test User',
    });

    const req = createRequest({ name: 'Test User' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toEqual({
      uid: 'user-1',
      email: 'test@test.com',
    });
    expect(mockCreateOrUpdateUser).toHaveBeenCalledWith('user-1', 'test@test.com', 'Test User');
  });

  it('works without name in body', async () => {
    mockRequireAuth.mockResolvedValue({ uid: 'user-2', email: 'no-name@test.com' });
    mockCreateOrUpdateUser.mockResolvedValue({
      email: 'no-name@test.com',
      name: '',
    });

    const req = createRequest();
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockCreateOrUpdateUser).toHaveBeenCalledWith('user-2', 'no-name@test.com', undefined);
  });

  it('handles errors from user service gracefully', async () => {
    mockRequireAuth.mockResolvedValue({ uid: 'user-3', email: 'err@test.com' });
    mockCreateOrUpdateUser.mockRejectedValue(new Error('Firestore down'));

    const req = createRequest();
    const res = await POST(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.code).toBe('INTERNAL_ERROR');
    expect(data.message).toBe('Firestore down');
  });
});
