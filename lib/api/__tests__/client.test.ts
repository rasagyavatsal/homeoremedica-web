import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../client';

// Use vi.spyOn to mock the request method
describe('WebApiClient', () => {
  let requestSpy: any;

  beforeEach(() => {
    requestSpy = vi.spyOn(apiClient as any, 'request');
    requestSpy.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call sendChatMessage with the chat endpoint and payload', async () => {
    const request = {
      message: 'How is Nux vomica described?',
      history: [{ role: 'user' as const, content: 'Earlier question' }],
    };

    await apiClient.sendChatMessage(request);

    expect(requestSpy).toHaveBeenCalledWith('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  });
});
