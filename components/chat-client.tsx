'use client';

import { useEffect, useRef, useState } from 'react';
import { History } from 'lucide-react';

import {
  ChatComposer,
  ChatEmptyState,
  ChatError,
  ChatThread,
  type ChatMessage,
} from '@/components/chat-view';
import { ChatSidebar } from '@/components/chat-sidebar';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { apiClient } from '@/lib/api/client';
import { chatAnswerBody } from '@/lib/chat-answer';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  appendExchange,
  createChat,
  deleteChat,
  loadChat,
  subscribeToChats,
} from '@/lib/services/chat-history';
import type { ChatMessageRecord, ChatSummary } from '@/lib/types/chat-history';

const HISTORY_TURN_LIMIT = 20;

const HISTORY_ERROR_MESSAGE = 'Your chat history could not be loaded. Please try again.';

function historyErrorMessage(cause: unknown): string {
  const message = (cause as { message?: unknown })?.message;
  return typeof message === 'string' && message ? message : HISTORY_ERROR_MESSAGE;
}

export default function ChatClient() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [resumingChatId, setResumingChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    threadEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }
    setHistoryError(null);
    const unsubscribe = subscribeToChats(
      user.uid,
      (nextChats) => setChats(nextChats),
      () => setHistoryError(HISTORY_ERROR_MESSAGE),
    );
    return unsubscribe;
  }, [user]);

  /** Saves a completed exchange, creating the chat when the thread is new. */
  const persistExchange = async (exchange: ChatMessageRecord[]) => {
    if (!user) return;
    try {
      if (activeChatId) {
        await appendExchange(activeChatId, exchange);
      } else {
        const created = await createChat(user.uid, exchange);
        setActiveChatId(created.id);
      }
    } catch (cause) {
      console.error('Failed to save chat exchange:', cause);
      setHistoryError('Your chat could not be saved to your account.');
    }
  };

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

    try {
      const response = await apiClient.sendChatMessage({ message: text, history });
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: chatAnswerBody(response.answer),
        sources: response.sources,
      };
      setMessages((current) => [...current, assistantMessage]);
      await persistExchange([userMessage, assistantMessage]);
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
    setActiveChatId(null);
    setError(null);
    setHistoryError(null);
    setDraft('');
    setIsSidebarOpen(false);
    textareaRef.current?.focus();
  };

  const resumeChat = async (chatId: string) => {
    if (chatId === activeChatId) {
      setIsSidebarOpen(false);
      return;
    }

    setResumingChatId(chatId);
    setHistoryError(null);
    try {
      const chat = await loadChat(chatId);
      if (!chat) {
        setHistoryError('That chat no longer exists.');
        return;
      }
      setMessages(chat.messages);
      setActiveChatId(chatId);
      setDraft('');
      setError(null);
    } catch (cause) {
      setHistoryError(historyErrorMessage(cause));
    } finally {
      setResumingChatId(null);
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setHistoryError(null);
    try {
      await deleteChat(chatId);
      if (chatId === activeChatId) {
        setMessages([]);
        setActiveChatId(null);
      }
    } catch (cause) {
      console.error('Failed to delete chat:', cause);
      setHistoryError('That chat could not be deleted. Please try again.');
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Header />

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-stretch">
        <aside
          aria-label="Chat history sidebar"
          className="hidden w-72 shrink-0 flex-col border-r border-border lg:flex"
        >
          <ChatSidebar
            user={user}
            chats={chats}
            activeChatId={activeChatId}
            isResuming={resumingChatId !== null}
            onNewChat={startNewChat}
            onSelectChat={(chatId) => void resumeChat(chatId)}
            onDeleteChat={(chatId) => void handleDeleteChat(chatId)}
          />
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl px-4 pt-3 sm:px-6 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <History aria-hidden="true" className="h-4 w-4" />
              History
            </Button>
          </div>

          {hasMessages ? (
            <>
              <h1 className="sr-only">Chat with the materia medica</h1>
              <ChatThread messages={messages} isSending={isSending} threadEndRef={threadEndRef} />
            </>
          ) : (
            <ChatEmptyState />
          )}

          {error ? <ChatError error={error} /> : null}
          {historyError ? <ChatError error={historyError} /> : null}

          <ChatComposer
            draft={draft}
            isSending={isSending}
            textareaRef={textareaRef}
            onDraftChange={setDraft}
            onSubmit={sendMessage}
          />
        </main>
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chat history</SheetTitle>
            <SheetDescription>Pick up where you left off.</SheetDescription>
          </SheetHeader>
          <ChatSidebar
            user={user}
            chats={chats}
            activeChatId={activeChatId}
            isResuming={resumingChatId !== null}
            onNewChat={startNewChat}
            onSelectChat={(chatId) => void resumeChat(chatId)}
            onDeleteChat={(chatId) => void handleDeleteChat(chatId)}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
