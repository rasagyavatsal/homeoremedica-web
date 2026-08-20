'use client';

import type { FormEvent, KeyboardEvent, RefObject } from 'react';
import { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { MotionGroup, MotionItem, MotionSection } from '@/components/ui/motion';
import { motionClassNames } from '@/lib/motion/system';
import type { ChatSource } from '@/lib/types/chat';
import { cn } from '@/lib/utils';

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
        Answers draw only from Clarke, Boericke, Kent, and Allen.
      </p>
    </MotionSection>
  );
}

const BUBBLE_PILL_MAX_LENGTH = 140;
const MESSAGE_COLLAPSE_LENGTH = 320;

/**
 * Short messages read as pills; once a message wraps to several lines the
 * pill end-caps would clip into the first and last lines, so larger messages
 * collapse to the same heavily curved radius as the home page surfaces.
 */
function messageBubbleRadius(content: string) {
  const isLong = content.length > BUBBLE_PILL_MAX_LENGTH || content.includes('\n');
  return isLong ? 'rounded-2xl' : 'rounded-full';
}

/**
 * Cuts a long message at a word boundary for the collapsed preview, or
 * returns null when the message is short enough to render in full.
 */
function truncateMessage(content: string) {
  if (content.length <= MESSAGE_COLLAPSE_LENGTH) return null;

  const boundary = content.lastIndexOf(' ', MESSAGE_COLLAPSE_LENGTH);
  const end = boundary > MESSAGE_COLLAPSE_LENGTH / 2 ? boundary : MESSAGE_COLLAPSE_LENGTH;
  return `${content.slice(0, end)}…`;
}

function UserMessageView({ content }: Readonly<{ content: string }>) {
  const [expanded, setExpanded] = useState(false);
  const collapsedText = truncateMessage(content);
  const isCollapsible = collapsedText !== null;

  return (
    <div className="flex justify-end">
      <div className="flex min-w-0 flex-col items-end">
        <p
          className={cn(
            'w-fit max-w-chat-bubble whitespace-pre-wrap break-words border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground',
            messageBubbleRadius(content),
          )}
        >
          {isCollapsible && !expanded ? collapsedText : content}
        </p>
        {isCollapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className="mt-1.5 text-xs font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ChatMessageView({ message }: Readonly<{ message: ChatMessage }>) {
  if (message.role === 'user') {
    return <UserMessageView content={message.content} />;
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
    <section aria-label="Conversation" className="mx-auto w-full max-w-2xl px-6 py-2 lg:py-6">
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
    <div className="mx-auto w-full max-w-2xl px-6 pb-3">
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
      <div className="mx-auto w-full max-w-2xl px-6">
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
      </div>
    </div>
  );
}
