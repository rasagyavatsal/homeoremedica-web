import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockFindRemedyResponseForApi = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server/repertory/service', () => ({
  findRemedyResponseForApi: mockFindRemedyResponseForApi,
}));

import { POST } from '../route';

function createRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/find', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/find', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid bookId with 400', async () => {
    const req = createRequest({ bookId: 'invalid', symptoms: ['headache'] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('rejects empty symptoms with 400', async () => {
    const req = createRequest({ bookId: 'boericke-MM', symptoms: [] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('rejects missing symptoms field with 400', async () => {
    const req = createRequest({ bookId: 'boericke-MM' });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('returns FindRemedyResponse shape from service', async () => {
    const mockResponse = {
      remedies: [
        {
          id: 'belladonna-boericke-MM',
          name: 'Belladonna',
          description: 'A common remedy',
          score: 3,
          matchedSymptoms: ['headache', 'fever', 'throbbing'],
          sourceBooks: ['boericke-MM'],
        }
      ],
      totalMatches: 1
    };
    mockFindRemedyResponseForApi.mockResolvedValue(mockResponse);

    const req = createRequest({
      bookId: 'boericke-MM',
      symptoms: ['headache', 'fever', 'throbbing'],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(mockFindRemedyResponseForApi).toHaveBeenCalledWith('boericke-MM', ['headache', 'fever', 'throbbing']);
  });

  it('returns 500 on internal error', async () => {
    mockFindRemedyResponseForApi.mockRejectedValue(new Error('DB error'));

    const req = createRequest({ bookId: 'boericke-MM', symptoms: ['headache'] });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.code).toBe('INTERNAL_ERROR');
  });
});
