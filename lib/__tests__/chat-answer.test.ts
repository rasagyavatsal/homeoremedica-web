import { describe, expect, it } from 'vitest';

import { CHAT_SAFETY_NOTICE, chatAnswerBody } from '@/lib/chat-answer';

describe('chatAnswerBody', () => {
  it('strips the prepended safety notice from backend answers', () => {
    expect(chatAnswerBody(`${CHAT_SAFETY_NOTICE}\n\nThe answer body.`)).toBe('The answer body.');
  });

  it('keeps answers that do not start with the notice untouched', () => {
    expect(chatAnswerBody('An answer without the notice.')).toBe('An answer without the notice.');
  });
});
