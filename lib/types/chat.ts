import type { SearchBookId } from '@/lib/seo/book-data';

// Mirrors the RAG chat backend contract (rag/src/homeoremedica_chat/chat.py).
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatTurn[];
  bookIds?: SearchBookId[];
}

export interface ChatSource {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string | null;
  remedyName: string;
  sectionTitle: string;
  passageIndexes: number[];
  text: string;
}

export interface ChatResponse {
  answer: string;
  corpusVersion: string;
  model: string;
  sources: ChatSource[];
}
