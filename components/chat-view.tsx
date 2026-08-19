'use client';

import type { FormEvent, KeyboardEvent, RefObject } from 'react';
import { useState } from 'react';
import { ArrowUp, BookOpen, ChevronDown, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { MotionGroup, MotionItem, MotionSection } from '@/components/ui/motion';
import { CHAT_SAFETY_NOTICE } from '@/lib/chat-answer';
import { motionClassNames } from '@/lib/motion/system';
import { getBookName } from '@/lib/seo/book-data';
import type { ChatSource } from '@/lib/types/chat';
import { cn, formatRemedyDisplayName } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
}

export function ChatEmptyState() {
  return (
    <MotionSection className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
      <h1 className="display-sm">Ask the materia medica</h1>
      <p className="balanced-copy mt-5 max-w-md text-base leading-relaxed text-on-surface-variant md:text-lg">
        Answers cite passages from Clarke, Boericke, Kent, and Allen.
      </p>
    </MotionSection>
  );
}

function ChatSources({ sources }: Readonly<{ sources: ChatSource[] }>) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 gap-2"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <BookOpen className="h-4 w-4" />
        <span>
          {sources.length} {sources.length === 1 ? 'source' : 'sources'}
        </span>
        <ChevronDown aria-hidden="true" className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </Button>

      {open ? (
        <ol className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
          {sources.map((source, index) => (
            <li key={source.id} className="border-b border-border p-4 last:border-b-0 md:p-5">
              <div className="flex items-baseline gap-3">
                <span aria-hidden="true" className="index-label shrink-0 text-primary">
                  [{index + 1}]
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatRemedyDisplayName(source.remedyName)} · {source.sectionTitle}
                  </p>
                  <p className="index-label mt-1">{getBookName(source.bookId)}</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                {source.text}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

const BUBBLE_PILL_MAX_LENGTH = 140;

/**
 * Short messages read as pills; once a message wraps to several lines the
 * pill end-caps would clip into the first and last lines, so larger messages
 * collapse to the same heavily curved radius as the home page surfaces.
 */
function messageBubbleRadius(content: string) {
  const isLong = content.length > BUBBLE_PILL_MAX_LENGTH || content.includes('\n');
  return isLong ? 'rounded-2xl' : 'rounded-full';
}

function ChatMessageView({ message }: Readonly<{ message: ChatMessage }>) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p
          className={cn(
            'w-fit max-w-dialog whitespace-pre-wrap break-words border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground',
            messageBubbleRadius(message.content),
          )}
        >
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <article className="space-y-4">
      <div className="space-y-3">
        {message.content.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-foreground">
            {paragraph}
          </p>
        ))}
      </div>
      {message.sources && message.sources.length > 0 ? <ChatSources sources={message.sources} /> : null}
    </article>
  );
}

export function ChatThread({
  messages,
  isSending,
  threadEndRef,
}: Readonly<{
  messages: ChatMessage[];
  isSending: boolean;
  threadEndRef: RefObject<HTMLDivElement | null>;
}>) {
  return (
    <section aria-label="Conversation" className="mx-auto w-full max-w-3xl px-4 py-2 sm:px-6 lg:py-6">
      <MotionGroup className="space-y-6">
        {messages.map((message) => (
          <MotionItem key={message.id}>
            <ChatMessageView message={message} />
          </MotionItem>
        ))}
      </MotionGroup>

      {isSending ? (
        <div className="mt-6 flex items-center gap-3 text-on-surface-variant">
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
          <span className="sr-only">Waiting for the answer</span>
        </div>
      ) : null}

      <div ref={threadEndRef} aria-hidden="true" className="h-px" />
    </section>
  );
}

export function ChatError({ error }: Readonly<{ error: string }>) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6">
      <Callout variant="destructive" className="text-sm">
        {error}
      </Callout>
    </div>
  );
}

export function ChatComposer({
  draft,
  isSending,
  textareaRef,
  onDraftChange,
  onSubmit,
}: Readonly<{
  draft: string;
  isSending: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
}>) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="sticky bottom-3 z-40 mt-auto">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className={cn(
            'rounded-full border border-border bg-background/90 shadow-soft backdrop-blur-lg focus-within:border-primary',
            motionClassNames.surface,
          )}
        >
          <div className="flex items-end gap-3 px-4 py-2 md:px-5">
            <label htmlFor="chat-message" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-message"
              ref={textareaRef}
              rows={1}
              value={draft}
              maxLength={4000}
              placeholder="Ask about a remedy or symptom…"
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none overflow-y-auto border-0 bg-transparent py-2.5 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isSending || draft.trim().length === 0}
              aria-label="Send message"
              className="mb-0.5 shrink-0"
            >
              {isSending ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp aria-hidden="true" className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
        <p className="mt-2 text-center text-xs leading-relaxed text-on-surface-variant">
          {CHAT_SAFETY_NOTICE}
        </p>
      </div>
    </div>
  );
}
