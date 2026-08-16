import { ApiClient } from '@/lib/api/base-client';
import { getAppCheckToken } from '@/lib/app-check/client';
import type { ChatRequest, ChatResponse } from '@/lib/types/chat';

class WebApiClient extends ApiClient {
  // Grounded chat (used by chat-client.tsx) — web-only
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiClient = new WebApiClient('/api', getAppCheckToken);
