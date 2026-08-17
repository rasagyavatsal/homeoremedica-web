import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSendChatMessage = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server/chat-service', () => ({
  sendChatMessage: mockSendChatMessage,
}));

import { POST } from '../route';

function createRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a blank message with 400', async () => {
    const res = await POST(createRequest({ message: '   ' }));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('rejects an unknown bookId with 400', async () => {
    const res = await POST(createRequest({ message: 'Hello', bookIds: ['kent'] }));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('rejects duplicate bookIds with 400', async () => {
    const res = await POST(
      createRequest({ message: 'Hello', bookIds: ['kent-lectures', 'kent-lectures'] }),
    );

    expect(res.status).toBe(400);
  });

  it('rejects an over-long history with 400', async () => {
    const history = Array.from({ length: 21 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `turn ${index}`,
    }));
    const res = await POST(createRequest({ message: 'Hello', history }));

    expect(res.status).toBe(400);
  });

  it('returns the chat response from the service', async () => {
    const mockResponse = {
      answer: 'Nux vomica is irritable [1].',
      corpusVersion: '2026-08-15.v1',
      model: 'gemini-2.5-flash-lite',
      sources: [],
    };
    mockSendChatMessage.mockResolvedValue(mockResponse);

    const res = await POST(
      createRequest({
        message: 'How is Nux vomica described?',
        history: [{ role: 'user', content: 'Earlier question' }],
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(mockSendChatMessage).toHaveBeenCalledWith({
      message: 'How is Nux vomica described?',
      history: [{ role: 'user', content: 'Earlier question' }],
    });
  });

  it('maps an upstream failure to 502', async () => {
    mockSendChatMessage.mockRejectedValue({
      code: 'UPSTREAM_UNAVAILABLE',
      message: 'The chat service could not answer right now. Please try again.',
    });

    const res = await POST(createRequest({ message: 'Hello' }));

    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('returns 500 on an unexpected error', async () => {
    mockSendChatMessage.mockRejectedValue(new Error('boom'));

    const res = await POST(createRequest({ message: 'Hello' }));

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.code).toBe('INTERNAL_ERROR');
  });
});
