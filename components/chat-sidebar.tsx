'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, MessageSquare, MoreVertical, Pencil, Plus, Settings, Trash2 } from 'lucide-react';

import { BrandLockup } from '@/components/brand-lockup';
import { ThemeMenuItem } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldHint, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { isGoogleUser, signOutUser } from '@/lib/auth/firebase-auth';
import { CHAT_TITLE_MAX_LENGTH, formatChatDate } from '@/lib/services/chat-history';
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
 * manages its own per-chat options dropdown (rename/delete), the rename
 * modal, delete confirmation modal, and account actions.
 */
export function ChatSidebar({
  user,
  chats,
  activeChatId,
  isResuming,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onNavigate,
}: Readonly<{
  user: ChatSidebarUser | null;
  chats: ChatSummary[];
  activeChatId: string | null;
  isResuming: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  onNavigate?: () => void;
}>) {
  const router = useRouter();
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const renameChat = chats.find((chat) => chat.id === renameChatId) ?? null;
  const pendingDeleteChat = chats.find((chat) => chat.id === pendingDeleteId) ?? null;

  const handleSelect = (chatId: string) => {
    onSelectChat(chatId);
    onNavigate?.();
  };

  const openRename = (chat: ChatSummary) => {
    setRenameChatId(chat.id);
    setRenameDraft(chat.title);
  };

  const handleSaveRename = () => {
    const nextTitle = renameDraft.trim();
    if (!renameChat || !nextTitle || nextTitle === renameChat.title) return;
    onRenameChat(renameChat.id, nextTitle);
    setRenameChatId(null);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const usesGoogleProvider = user ? isGoogleUser() : false;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center border-b border-border px-3 py-2.5">
        <Link
          href="/"
          aria-label="HomeoRemedica home"
          className="inline-flex min-h-touch items-center"
          onClick={onNavigate}
        >
          <BrandLockup />
        </Link>
      </div>

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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Chat options for ${chat.title}`}
                      className="absolute right-1.5 rounded-full p-1.5 text-on-surface-variant opacity-60 transition-colors hover:text-foreground focus-visible:text-foreground group-hover:opacity-100 data-[state=open]:opacity-100"
                    >
                      <MoreVertical aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end" className="w-44">
                    <DropdownMenuItem className="cursor-pointer" onSelect={() => openRename(chat)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onSelect={() => setPendingDeleteId(chat.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </nav>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden="true" />
      )}

      <div className="shrink-0 border-t border-border p-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface-container-low"
              >
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-medium text-accent-foreground"
                >
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {user.displayName || 'Account'}
                  </span>
                  <span className="block truncate text-xs text-on-surface-variant">
                    {user.email}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-72 p-2">
              <div className="border-b border-border px-3 pb-3 pt-2">
                <p className="text-sm font-medium text-foreground">{user.displayName || 'Account'}</p>
                <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
              </div>
              <ThemeMenuItem />
              {usesGoogleProvider ? null : (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="mt-1 cursor-pointer"
                    onClick={() => {
                      router.push('/settings');
                      onNavigate?.();
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => void handleLogout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="m-1 rounded-xl border border-border bg-surface-container-low p-4">
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

      <Dialog
        open={renameChat !== null}
        onOpenChange={(open) => {
          if (!open) setRenameChatId(null);
        }}
      >
        <DialogContent className="flex max-h-viewport-dialog flex-col">
          <DialogHeader className="shrink-0 px-6 pt-6">
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription className="truncate">
              {renameChat?.title ?? ''}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4">
            <Field>
              <FieldLabel htmlFor="chat-rename">Chat title</FieldLabel>
              <Input
                id="chat-rename"
                value={renameDraft}
                maxLength={CHAT_TITLE_MAX_LENGTH}
                onChange={(event) => setRenameDraft(event.target.value)}
              />
              <FieldHint>Up to {CHAT_TITLE_MAX_LENGTH} characters</FieldHint>
            </Field>
          </div>
          <DialogFooter className="shrink-0 px-6 pb-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              disabled={
                !renameChat ||
                renameDraft.trim().length === 0 ||
                renameDraft.trim() === renameChat.title
              }
              onClick={handleSaveRename}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDeleteChat !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              {pendingDeleteChat
                ? `"${pendingDeleteChat.title}" will be permanently deleted. This cannot be undone.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 pb-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={!pendingDeleteChat}
              onClick={() => {
                if (pendingDeleteChat) onDeleteChat(pendingDeleteChat.id);
                setPendingDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
