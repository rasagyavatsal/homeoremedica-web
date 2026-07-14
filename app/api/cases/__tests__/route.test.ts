import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const {
  mockTimestampNow,
  mockAdd,
  mockGet,
  mockOrderBy,
  mockCollection,
  mockDoc,
  mockRequireAuth,
} = vi.hoisted(() => ({
  mockTimestampNow: vi.fn().mockReturnValue({
    toDate: () => new Date('2024-01-15T10:00:00.000Z'),
  }),
  mockAdd: vi.fn(),
  mockGet: vi.fn(),
  mockOrderBy: vi.fn(),
  mockCollection: vi.fn(),
  mockDoc: vi.fn(),
  mockRequireAuth: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
  const createSubCollectionMock = () => ({
    orderBy: (...oArgs: any[]) => {
      mockOrderBy(...oArgs);
      return { get: mockGet };
    },
    add: mockAdd,
  });

  const createDocMock = () => ({
    collection: (...cArgs: any[]) => {
      mockCollection(...cArgs);
      return createSubCollectionMock();
    },
  });

  const createCollectionMock = () => ({
    doc: (...dArgs: any[]) => {
      mockDoc(...dArgs);
      return createDocMock();
    },
  });

  return {
    adminDb: {
      collection: (...args: any[]) => {
        mockCollection(...args);
        return createCollectionMock();
      },
    },
    adminSdk: {
      firestore: {
        Timestamp: {
          now: mockTimestampNow,
        },
      },
    },
  };
});

vi.mock('@/lib/auth/middleware', () => ({
  requireAuth: (...args: any[]) => mockRequireAuth(...args),
}));

import { GET, POST } from '../route';

function createGetRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  if (authHeader) headers.set('authorization', authHeader);
  return new NextRequest('http://localhost:3000/api/cases', { headers });
}

function createPostRequest(body: any, authHeader?: string): NextRequest {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (authHeader) headers.set('authorization', authHeader);
  return new NextRequest('http://localhost:3000/api/cases', {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
}

describe('GET /api/cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without valid auth token', async () => {
    mockRequireAuth.mockRejectedValue({
      code: 'AUTH_REQUIRED',
      message: 'Authentication required.',
    });

    const req = createGetRequest();
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.code).toBe('AUTH_REQUIRED');
  });

  it('returns serialized cases array', async () => {
    mockRequireAuth.mockResolvedValue({ uid: 'user-1', email: 'test@test.com' });

    const now = { toDate: () => new Date('2024-01-15T10:00:00.000Z') };
    mockGet.mockResolvedValue({
      docs: [
        {
          id: 'case-1',
          data: () => ({
            title: 'My Case',
            name: 'My Case',
            note: 'Some note',
            bookId: 'boericke',
            symptoms: ['headache'],
            selectedSymptoms: [],
            results: [],
            userId: 'user-1',
            createdAt: now,
            updatedAt: now,
            timestamp: now,
          }),
        },
      ],
    });

    const req = createGetRequest('Bearer valid');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cases).toHaveLength(1);
    expect(data.cases[0].id).toBe('case-1');
    expect(data.cases[0].title).toBe('My Case');
    expect(data.cases[0].createdAt).toBe('2024-01-15T10:00:00.000Z');
  });
});

describe('POST /api/cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ uid: 'user-1', email: 'test@test.com' });
    mockAdd.mockResolvedValue({ id: 'new-case-id' });
  });

  it('rejects empty body with no name/title (400)', async () => {
    const req = createPostRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('creates and returns case (201)', async () => {
    const req = createPostRequest({ name: 'New Case' });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('new-case-id');
    expect(data.name).toBe('New Case');
    expect(data.title).toBe('New Case');
  });

  it('creates case with selectedSymptoms', async () => {
    const req = createPostRequest({
      name: 'Symptom Case',
      selectedSymptoms: [{ id: 's1', name: 'headache' }],
      bookId: 'boericke',
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.selectedSymptoms).toHaveLength(1);
    expect(data.symptoms).toContain('headache');
  });

  it('returns 401 when auth fails', async () => {
    mockRequireAuth.mockRejectedValue({
      code: 'AUTH_REQUIRED',
      message: 'Authentication required.',
    });

    const req = createPostRequest({ name: 'Test' });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});
