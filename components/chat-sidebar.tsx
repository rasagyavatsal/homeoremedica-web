'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatChatDate } from '@/lib/services/chat-history';
import type { ChatSummary } from '@/lib/types/chat-history';
import { cn } from '@/lib/utils';

export interface ChatSidebarUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

/**
 * Presentational chat-history panel. Rendering contexts:
 * - desktop: persistent aside on /chat
 * - mobile: inside the history Sheet
 * The owner (chat-client) supplies state and mutations; this component only
 * manages its own inline delete confirmation.
 */
export function ChatSidebar({
  user,
  chats,
  activeChatId,
  isResuming,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onNavigate,
}: Readonly<{
  user: ChatSidebarUser | null;
  chats: ChatSummary[];
  activeChatId: string | null;
  isResuming: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNavigate?: () => void;
}>) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleSelect = (chatId: string) => {
    onSelectChat(chatId);
    onNavigate?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border p-3">
        <Button className="w-full justify-start gap-2" onClick={onNewChat}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {user ? (
        <nav
          aria-label="Chat history"
          className={cn(
            'min-h-0 flex-1 space-y-1 overflow-y-auto p-2',
            isResuming && 'pointer-events-none opacity-60',
          )}
        >
          {chats.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm leading-relaxed text-on-surface-variant">
              <p>No chats yet.</p>
              <p className="mt-1">
                Ask the materia medica a question and it will appear here.
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id} className="group relative flex items-center rounded-full">
                <button
                  type="button"
                  onClick={() => handleSelect(chat.id)}
                  aria-current={chat.id === activeChatId ? 'true' : undefined}
                  className={cn(
                    'flex min-h-touch min-w-0 flex-1 items-center gap-2.5 rounded-full px-3 py-2 pr-10 text-left text-sm transition-colors',
                    chat.id === activeChatId
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-foreground',
                  )}
                >
                  <MessageSquare aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{chat.title}</span>
                    <time className="block text-xs leading-relaxed text-on-surface-variant">
                      {formatChatDate(chat.updatedAt)}
                    </time>
                  </span>
                </button>

                {confirmingDeleteId === chat.id ? (
                  <span className="absolute right-1.5 flex items-center gap-1 rounded-full bg-card">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => {
                        onDeleteChat(chat.id);
                        setConfirmingDeleteId(null);
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Delete chat ${chat.title}`}
                    onClick={() => setConfirmingDeleteId(chat.id)}
                    className="absolute right-1.5 rounded-full p-1.5 text-on-surface-variant opacity-60 transition-colors hover:text-destructive focus-visible:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </nav>
      ) : (
        <div className="m-3 rounded-xl border border-border bg-surface-container-low p-4">
          <p className="text-sm font-medium text-foreground">Sign in to save your chats</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
            Your chat history is saved to your account and available on every device.
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link href="/auth/login" onClick={onNavigate}>
              Sign in
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
