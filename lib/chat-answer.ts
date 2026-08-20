/*
 * The RAG backend prepends a fixed safety notice to every answer. The chat UI
 * shows that notice once, persistently under the composer, so the per-message
 * copy is separated here for display and for the history sent back upstream.
 */
export const CHAT_SAFETY_NOTICE =
  'Historical materia medica reference only—not medical advice. For health decisions, consult a qualified clinician.';

export function chatAnswerBody(answer: string): string {
  if (!answer.startsWith(CHAT_SAFETY_NOTICE)) {
    return answer.trim();
  }

  return answer.slice(CHAT_SAFETY_NOTICE.length).trim();
}

/**
 * Citation labels like "[1]" or "[2, 3]" name backend sources that the UI
 * no longer reveals, so they read as noise to users. Strip them (plus the
 * space before them) without touching bracketed text in the answer itself.
 */
const CITATION_LABEL_PATTERN = / *\[\d+(?: *, *\d+)*\]/g;

export function cleanAnswerCitations(text: string): string {
  return text.replace(CITATION_LABEL_PATTERN, '');
}
