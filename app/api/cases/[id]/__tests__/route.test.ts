import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockCaseGet, mockCaseUpdate, mockCaseDelete, mockRequireAuth } = vi.hoisted(() => ({
  mockCaseGet: vi.fn(),
  mockCaseUpdate: vi.fn(),
  mockCaseDelete: vi.fn(),
  mockRequireAuth: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
  function mockCaseDoc() {
    return {
      get: mockCaseGet,
      update: mockCaseUpdate,
      delete: mockCaseDelete,
    };
  }

  function mockCasesCollection() {
    return {
      doc: mockCaseDoc,
    };
  }

  function mockUserDoc() {
    return {
      collection: mockCasesCollection,
    };
  }

  function mockRootCollection() {
    return {
      doc: mockUserDoc,
    };
  }

  return {
    adminDb: {
      collection: mockRootCollection,
    },
  };
});

vi.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: () => ({
      toDate: () => new Date('2024-01-15T10:00:00.000Z'),
    }),
  },
}));

vi.mock('@/lib/auth/middleware', () => ({
  requireAuth: (...args: any[]) => mockRequireAuth(...args),
}));

import { PATCH, DELETE } from '../route';

function createPatchRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/cases/case-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function createDeleteRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/cases/case-1', {
    method: 'DELETE',
  });
}

function createParamsPromise(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id });
}

describe('PATCH /api/cases/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ uid: 'user-1', email: 'test@test.com' });
  });

  it('validates with updateCaseSchema — rejects empty update', async () => {
    const req = createPatchRequest({});
    const res = await PATCH(req, { params: createParamsPromise('case-1') });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('returns 404 for nonexistent case', async () => {
    mockCaseGet.mockResolvedValue({ exists: false });

    const req = createPatchRequest({ name: 'Updated' });
    const res = await PATCH(req, { params: createParamsPromise('nonexistent') });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.code).toBe('NOT_FOUND');
  });

  it('partial update works and returns updated case', async () => {
    const now = { toDate: () => new Date('2024-01-15T10:00:00.000Z') };
    mockCaseGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          title: 'Original',
          name: 'Original',
          note: '',
          userId: 'user-1',
          createdAt: now,
          updatedAt: now,
          timestamp: now,
        }),
      })
      .mockResolvedValueOnce({
        id: 'case-1',
        exists: true,
        data: () => ({
          title: 'Updated',
          name: 'Updated',
          note: '',
          userId: 'user-1',
          createdAt: now,
          updatedAt: now,
          timestamp: now,
        }),
      });
    mockCaseUpdate.mockResolvedValue(undefined);

    const req = createPatchRequest({ name: 'Updated' });
    const res = await PATCH(req, { params: createParamsPromise('case-1') });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Updated');
    expect(mockCaseUpdate).toHaveBeenCalled();
  });

  it('returns 400 for invalid case ID', async () => {
    const req = createPatchRequest({ name: 'Test' });
    const res = await PATCH(req, { params: createParamsPromise('') });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('returns 401 when auth fails', async () => {
    mockRequireAuth.mockRejectedValue({
      code: 'AUTH_REQUIRED',
      message: 'Authentication required.',
    });

    const req = createPatchRequest({ name: 'Updated' });
    const res = await PATCH(req, { params: createParamsPromise('case-1') });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/cases/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ uid: 'user-1', email: 'test@test.com' });
  });

  it('requires auth (401 without token)', async () => {
    mockRequireAuth.mockRejectedValue({
      code: 'AUTH_REQUIRED',
      message: 'Authentication required.',
    });

    const req = createDeleteRequest();
    const res = await DELETE(req, { params: createParamsPromise('case-1') });

    expect(res.status).toBe(401);
  });

  it('returns 404 for nonexistent case', async () => {
    mockCaseGet.mockResolvedValue({ exists: false });

    const req = createDeleteRequest();
    const res = await DELETE(req, { params: createParamsPromise('nonexistent') });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.code).toBe('NOT_FOUND');
  });

  it('returns { success: true } on successful delete', async () => {
    mockCaseGet.mockResolvedValue({ exists: true });
    mockCaseDelete.mockResolvedValue(undefined);

    const req = createDeleteRequest();
    const res = await DELETE(req, { params: createParamsPromise('case-1') });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true });
    expect(mockCaseDelete).toHaveBeenCalled();
  });

  it('returns 400 for empty case ID', async () => {
    const req = createDeleteRequest();
    const res = await DELETE(req, { params: createParamsPromise('') });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });
});
