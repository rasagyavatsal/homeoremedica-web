import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSearchSymptomsForApi = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server/repertory/service', () => ({
  searchSymptomsForApi: mockSearchSymptomsForApi,
}));

import { GET } from '../route';

function createRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/symptoms/search');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe('GET /api/symptoms/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty results for short query (< 2 chars)', async () => {
    const req = createRequest({ query: 'a', book: 'boericke-MM' });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ results: [], total: 0 });
    expect(mockSearchSymptomsForApi).not.toHaveBeenCalled();
  });

  it('returns empty results for missing query', async () => {
    const req = createRequest({ book: 'boericke-MM' });
    const res = await GET(req);
    const data = await res.json();

    expect(data).toEqual({ results: [], total: 0 });
  });

  it('returns 400 if book param is missing', async () => {
    const req = createRequest({ query: 'headache' });
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Book is required');
  });

  it('returns 400 for a retired book identifier', async () => {
    const res = await GET(createRequest({ query: 'headache', book: 'boericke' }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid book' });
    expect(mockSearchSymptomsForApi).not.toHaveBeenCalled();
  });

  it('returns results from service', async () => {
    const mockResponse = {
      total: 2,
      results: [
        { name: 'Itching of skin', books: ['boericke-MM'], matchType: 'exact', relevanceScore: 2 },
        { name: 'Pruritus ani', books: ['boericke-MM'], matchType: 'mapping', relevanceScore: 1 }
      ]
    };
    mockSearchSymptomsForApi.mockResolvedValue(mockResponse);

    const req = createRequest({ query: 'itching', book: 'boericke-MM' });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(mockSearchSymptomsForApi).toHaveBeenCalledWith('boericke-MM', 'itching', 50, 0);
  });

  it('pagination: limit/offset params work correctly', async () => {
    mockSearchSymptomsForApi.mockResolvedValue({ results: [], total: 0 });

    const req = createRequest({ query: 'head', book: 'clarke-MM', limit: '1', offset: '10' });
    await GET(req);
    
    expect(mockSearchSymptomsForApi).toHaveBeenCalledWith('clarke-MM', 'head', 1, 10);
  });

  it('returns 500 on service error', async () => {
    mockSearchSymptomsForApi.mockRejectedValue(new Error('Service failed'));

    const req = createRequest({ query: 'head', book: 'boericke-MM' });
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Service failed');
  });
});
