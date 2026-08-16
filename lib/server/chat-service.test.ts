import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sendChatMessage } from '@/lib/server/chat-service';

describe('sendChatMessage', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockUpstream(body: unknown, status = 200) {
    fetchSpy.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });
  }

  it('posts the turn to the deployed chat backend by default', async () => {
    const payload = { answer: 'a', corpusVersion: 'v', model: 'm', sources: [] };
    mockUpstream(payload);

    const result = await sendChatMessage({
      message: 'How is Nux vomica described?',
      history: [{ role: 'user', content: 'Earlier' }],
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://homeoremedica-chat-619837289655.us-central1.run.app/v1/chat');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toEqual({
      message: 'How is Nux vomica described?',
      history: [{ role: 'user', content: 'Earlier' }],
    });
    expect(result).toEqual(payload);
  });

  it('honours the RAG_CHAT_BASE_URL override and forwards bookIds', async () => {
    vi.stubEnv('RAG_CHAT_BASE_URL', 'http://127.0.0.1:8000/');
    mockUpstream({ answer: 'a', corpusVersion: 'v', model: 'm', sources: [] });

    await sendChatMessage({ message: 'Hi', bookIds: ['kent-lectures'] });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:8000/v1/chat');
    expect(JSON.parse(options.body as string)).toEqual({
      message: 'Hi',
      history: [],
      bookIds: ['kent-lectures'],
    });
  });

  it('maps network failures to UPSTREAM_UNAVAILABLE', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('socket hang up'));

    await expect(sendChatMessage({ message: 'Hi' })).rejects.toEqual({
      code: 'UPSTREAM_UNAVAILABLE',
      message: 'The chat service could not answer right now. Please try again.',
    });
  });

  it('maps non-OK upstream responses to UPSTREAM_UNAVAILABLE', async () => {
    mockUpstream({ detail: 'bad' }, 500);

    await expect(sendChatMessage({ message: 'Hi' })).rejects.toMatchObject({
      code: 'UPSTREAM_UNAVAILABLE',
    });
  });
});
