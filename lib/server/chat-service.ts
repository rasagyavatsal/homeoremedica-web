import type { ApiError } from '@/lib/types/backend';
import type { ChatRequest, ChatResponse } from '@/lib/types/chat';

/*
 * Owns the server-side call to the deployed RAG chat backend. Browsers stay
 * on the same-origin /api/chat route, so the Cloud Run URL, its CORS policy,
 * and its failure modes never leak into client code.
 */
const DEFAULT_CHAT_API_BASE_URL =
  'https://homeoremedica-chat-619837289655.us-central1.run.app';
const CHAT_REQUEST_TIMEOUT_MS = 90_000;

function chatApiBaseUrl(): string {
  const configured = process.env.RAG_CHAT_BASE_URL ?? DEFAULT_CHAT_API_BASE_URL;
  return configured.replace(/\/+$/, '');
}

function chatUnavailableError(): ApiError {
  return {
    code: 'UPSTREAM_UNAVAILABLE',
    message: 'The chat service could not answer right now. Please try again.',
  };
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  let response: Response;
  try {
    response = await fetch(`${chatApiBaseUrl()}/v1/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: request.message,
        history: request.history ?? [],
        ...(request.bookIds ? { bookIds: request.bookIds } : {}),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(CHAT_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw chatUnavailableError();
  }

  if (!response.ok) {
    throw chatUnavailableError();
  }

  return (await response.json()) as ChatResponse;
}
