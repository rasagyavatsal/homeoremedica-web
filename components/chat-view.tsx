'use client';

import type { FormEvent, KeyboardEvent, RefObject } from 'react';
import { useEffect, useState } from 'react';
import { ArrowUp, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { MotionGroup, MotionItem, MotionSection } from '@/components/ui/motion';
import { cleanAnswerCitations } from '@/lib/chat-answer';
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

const MESSAGE_COLLAPSE_LENGTH = 320;

/** Max composer height in px; beyond this the textarea scrolls instead of growing. */
const COMPOSER_MAX_HEIGHT_PX = 200;

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
        <div className="w-fit max-w-chat-bubble rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap break-words">
            {isCollapsible && !expanded ? collapsedText : content}
          </p>
          {isCollapsible ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none"
            >
              {expanded ? 'Show less' : 'Show more'}
              {expanded ? (
                <ChevronUp aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type EmphasisRun = { type: 'text' | 'strong'; value: string };

const EMPHASIS_PATTERN = /(\*\*[^*]+\*\*)|\*([^*\n]+)\*/g;

/**
 * Splits an answer paragraph into text and strong runs. Balanced **bold**
 * and *starred* runs become strong; any orphan asterisks left in plain text
 * are dropped so a stray star never renders.
 */
function parseEmphasisRuns(text: string): EmphasisRun[] {
  const runs: EmphasisRun[] = [];
  let cursor = 0;

  for (const match of text.matchAll(EMPHASIS_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) runs.push({ type: 'text', value: text.slice(cursor, index) });
    const value = match[1] !== undefined ? match[1].slice(2, -2) : (match[2] ?? '');
    runs.push({ type: 'strong', value });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) runs.push({ type: 'text', value: text.slice(cursor) });

  return runs
    .map((run) => (run.type === 'text' ? { ...run, value: run.value.replace(/\*/g, '') } : run))
    .filter((run) => run.value !== '');
}

/** Renders starred and double-starred spans in assistant answers as bold text. */
function BoldText({ text }: Readonly<{ text: string }>) {
  return (
    <>
      {parseEmphasisRuns(text).map((run, index) =>
        run.type === 'strong' ? (
          <strong key={index} className="font-semibold">
            {run.value}
          </strong>
        ) : (
          run.value
        ),
      )}
    </>
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
            <BoldText text={cleanAnswerCitations(paragraph)} />
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

  // Grow with the draft, then scroll once the composer reaches its cap.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || textarea.scrollHeight === 0) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, COMPOSER_MAX_HEIGHT_PX)}px`;
  }, [draft, textareaRef]);

  return (
    <div className="sticky bottom-3 z-40 mt-auto">
      <div className="mx-auto w-full max-w-2xl px-6">
        <form
          onSubmit={handleSubmit}
          className={cn(
            'rounded-xl border border-border bg-background/90 shadow-soft backdrop-blur-lg focus-within:border-primary',
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
