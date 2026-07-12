import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSearchRemediesForApi = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server/repertory/service', () => ({
  searchRemediesForApi: mockSearchRemediesForApi,
}));

import { POST } from '../route';

function createRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/remedies/search', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/remedies/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array for empty symptoms array', async () => {
    const req = createRequest({ symptoms: [], book: 'boericke' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockSearchRemediesForApi).not.toHaveBeenCalled();
  });

  it('returns empty array for missing symptoms', async () => {
    const req = createRequest({ book: 'boericke' });
    const res = await POST(req);
    const data = await res.json();

    expect(data).toEqual([]);
  });

  it('returns 400 for missing book', async () => {
    const req = createRequest({ symptoms: ['headache'] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Book is required');
  });

  it('returns results from service', async () => {
    const mockResponse = [
      {
        remedy: {
          id: 'belladonna',
          name: 'Belladonna',
          description: 'Desc',
          symptoms: ['headache', 'fever'],
          book: 'boericke'
        },
        score: 2,
        matchedSymptoms: ['headache', 'fever']
      }
    ];
    mockSearchRemediesForApi.mockResolvedValueOnce(mockResponse);

    const req = createRequest({ symptoms: ['headache', 'fever'], book: 'boericke' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(mockSearchRemediesForApi).toHaveBeenCalledWith('boericke', ['headache', 'fever']);
  });

  it('handles errors gracefully (returns 500)', async () => {
    mockSearchRemediesForApi.mockRejectedValue(new Error('Service failure'));

    const req = createRequest({ symptoms: ['headache'], book: 'boericke' });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Service failure');
  });
});
