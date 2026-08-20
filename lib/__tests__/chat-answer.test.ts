import { describe, expect, it } from 'vitest';

import { CHAT_SAFETY_NOTICE, chatAnswerBody, cleanAnswerCitations } from '@/lib/chat-answer';

describe('chatAnswerBody', () => {
  it('strips the prepended safety notice from backend answers', () => {
    expect(chatAnswerBody(`${CHAT_SAFETY_NOTICE}\n\nThe answer body.`)).toBe('The answer body.');
  });

  it('keeps answers that do not start with the notice untouched', () => {
    expect(chatAnswerBody('An answer without the notice.')).toBe('An answer without the notice.');
  });
});

describe('cleanAnswerCitations', () => {
  it('strips single citation labels without leaving stray spaces', () => {
    expect(cleanAnswerCitations('Nux vomica is chilly [1].')).toBe('Nux vomica is chilly.');
  });

  it('strips comma-separated citation labels', () => {
    expect(cleanAnswerCitations('It suits chilly people [1, 2] and the weary [3].')).toBe(
      'It suits chilly people and the weary.',
    );
  });

  it('leaves bracketed text that is not a citation', () => {
    expect(cleanAnswerCitations('Use the 30C potency [half a dose] once daily.')).toBe(
      'Use the 30C potency [half a dose] once daily.',
    );
  });
});
