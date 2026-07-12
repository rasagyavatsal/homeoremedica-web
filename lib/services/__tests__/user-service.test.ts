import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockUserGet, mockUserSet, mockUserUpdate, mockTimestampNow } = vi.hoisted(() => ({
  mockUserGet: vi.fn(),
  mockUserSet: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockTimestampNow: vi.fn().mockReturnValue({
    toDate: () => new Date('2024-01-15T10:00:00.000Z'),
  }),
}));

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      doc: () => ({
        get: mockUserGet,
        set: mockUserSet,
        update: mockUserUpdate,
      }),
    }),
  },
}));

vi.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: () => mockTimestampNow(),
  },
}));

import { createOrUpdateUser } from '../user-service';

describe('createOrUpdateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates new user in Firestore when not exists', async () => {
    mockUserGet.mockResolvedValue({ exists: false });
    mockUserSet.mockResolvedValue(undefined);

    const result = await createOrUpdateUser('uid-1', 'test@test.com', 'Test User');

    expect(mockUserSet).toHaveBeenCalledTimes(1);
    const setArg = mockUserSet.mock.calls[0][0];
    expect(setArg.email).toBe('test@test.com');
    expect(setArg.name).toBe('Test User');
    expect(result.email).toBe('test@test.com');
    expect(result.name).toBe('Test User');
  });

  it('creates user with empty name when name is not provided', async () => {
    mockUserGet.mockResolvedValue({ exists: false });
    mockUserSet.mockResolvedValue(undefined);

    const result = await createOrUpdateUser('uid-2', 'no-name@test.com');

    const setArg = mockUserSet.mock.calls[0][0];
    expect(setArg.name).toBe('');
    expect(result.name).toBe('');
  });

  it('updates existing user when email changed', async () => {
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({
        email: 'old@test.com',
        name: 'User',
        createdAt: { toDate: () => new Date() },
      }),
    });
    mockUserUpdate.mockResolvedValue(undefined);

    const result = await createOrUpdateUser('uid-3', 'new@test.com');

    expect(mockUserUpdate).toHaveBeenCalledTimes(1);
    const updateArg = mockUserUpdate.mock.calls[0][0];
    expect(updateArg.email).toBe('new@test.com');
    expect(result.email).toBe('new@test.com');
  });

  it('updates existing user when name changed', async () => {
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({
        email: 'test@test.com',
        name: 'Old Name',
        createdAt: { toDate: () => new Date() },
      }),
    });
    mockUserUpdate.mockResolvedValue(undefined);

    await createOrUpdateUser('uid-4', 'test@test.com', 'New Name');

    expect(mockUserUpdate).toHaveBeenCalledTimes(1);
    const updateArg = mockUserUpdate.mock.calls[0][0];
    expect(updateArg.name).toBe('New Name');
  });

  it('does not update when nothing changed', async () => {
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({
        email: 'same@test.com',
        name: 'Same Name',
        createdAt: { toDate: () => new Date() },
      }),
    });

    const result = await createOrUpdateUser('uid-5', 'same@test.com', 'Same Name');

    expect(mockUserUpdate).not.toHaveBeenCalled();
    expect(result.email).toBe('same@test.com');
  });

  it('falls back to mock user on Firebase error', async () => {
    mockUserGet.mockRejectedValue(new Error('Firestore unavailable'));

    const result = await createOrUpdateUser('uid-6', 'fallback@test.com', 'Fallback');

    expect(result.email).toBe('fallback@test.com');
    expect(result.name).toBe('Fallback');
    // Should not throw
  });
});
