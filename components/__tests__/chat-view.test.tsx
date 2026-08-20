import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatComposer } from '@/components/chat-view';

const COMPOSER_MAX_HEIGHT_PX = 200;

/** jsdom never lays out, so the auto-resize reads need an explicit scrollHeight. */
function setScrollHeight(textarea: HTMLTextAreaElement, height: number) {
  Object.defineProperty(textarea, 'scrollHeight', { value: height, configurable: true });
}

function renderComposer(draft: string) {
  const textareaRef = React.createRef<HTMLTextAreaElement>();
  const utils = render(
    <ChatComposer
      draft={draft}
      isSending={false}
      textareaRef={textareaRef}
      onDraftChange={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );
  const textarea = screen.getByLabelText('Message') as HTMLTextAreaElement;
  return {
    ...utils,
    textareaRef,
    textarea,
    rerenderWithDraft: (nextDraft: string) =>
      utils.rerender(
        <ChatComposer
          draft={nextDraft}
          isSending={false}
          textareaRef={textareaRef}
          onDraftChange={vi.fn()}
          onSubmit={vi.fn()}
        />,
      ),
  };
}

describe('ChatComposer', () => {
  it('grows with the draft and keeps scrolling disabled', () => {
    const { textarea, rerenderWithDraft } = renderComposer('');
    setScrollHeight(textarea, 60);

    rerenderWithDraft('Nux vomica');

    expect(textarea.style.height).toBe('60px');
    expect(textarea.style.overflowY).toBe('hidden');
  });

  it('caps growth at the max height and only enables scrolling then', () => {
    const { textarea, rerenderWithDraft } = renderComposer('');
    setScrollHeight(textarea, 500);

    rerenderWithDraft('Nux vomica '.repeat(50));

    expect(textarea.style.height).toBe(`${COMPOSER_MAX_HEIGHT_PX}px`);
    expect(textarea.style.overflowY).toBe('auto');
    // Dormant by default, then styled as a thin line on the right outline when active.
    expect(textarea.className).toContain('overflow-y-hidden');
    expect(textarea.className).toContain('scrollbar-thin');
    expect(textarea.className).toContain('[&::-webkit-scrollbar-track]:bg-transparent');
    expect(textarea.className).toContain('[&::-webkit-scrollbar]:w-1');
  });

  it('shrinks back and disables scrolling again as the draft is cleared', () => {
    const { textarea, rerenderWithDraft } = renderComposer('');
    setScrollHeight(textarea, 500);
    rerenderWithDraft('Nux vomica '.repeat(50));

    expect(textarea.style.overflowY).toBe('auto');

    setScrollHeight(textarea, 46);
    rerenderWithDraft('');

    expect(textarea.style.height).toBe('46px');
    expect(textarea.style.overflowY).toBe('hidden');
  });
});
