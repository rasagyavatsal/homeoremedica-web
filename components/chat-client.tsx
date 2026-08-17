'use client';

import { useEffect, useRef, useState } from 'react';

import { ChatComposer, ChatEmptyState, ChatError, ChatThread, type ChatMessage } from '@/components/chat-view';
import { Header } from '@/components/header';
import { apiClient } from '@/lib/api/client';
import { chatAnswerBody } from '@/lib/chat-answer';

const HISTORY_TURN_LIMIT = 20;

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    threadEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    const history = messages
      .slice(-HISTORY_TURN_LIMIT)
      .map(({ role, content }) => ({ role, content }));
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setError(null);
    setIsSending(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await apiClient.sendChatMessage({ message: text, history });
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: chatAnswerBody(response.answer),
          sources: response.sources,
        },
      ]);
    } catch (cause) {
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      setDraft(text);
      setError(
        typeof (cause as { message?: unknown })?.message === 'string'
          ? (cause as { message: string }).message
          : 'The chat service could not answer right now. Please try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setError(null);
    setDraft('');
    textareaRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 flex-col">
        {hasMessages ? (
          <>
            <h1 className="sr-only">Chat with the materia medica</h1>
            <ChatThread
              messages={messages}
              isSending={isSending}
              threadEndRef={threadEndRef}
              onNewChat={startNewChat}
            />
          </>
        ) : (
          <ChatEmptyState />
        )}
      </main>

      {error ? <ChatError error={error} /> : null}

      <ChatComposer
        draft={draft}
        isSending={isSending}
        textareaRef={textareaRef}
        onDraftChange={setDraft}
        onSubmit={sendMessage}
      />
    </div>
  );
}
