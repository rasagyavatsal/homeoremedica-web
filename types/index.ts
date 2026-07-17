import type { FindRemedyRequest as ZodFindRemedyRequest, SelectedSymptom } from '@/lib/validation/schemas';
import type { SearchBookId } from '@/lib/seo/book-data';

export type BookId = SearchBookId;

export interface Remedy {
  id: string;
  name: string;
  description?: string;
  symptoms?: string[];
  source?: string;
  book?: BookId;
}

export type Symptom = SelectedSymptom;

export interface Case {
  id: string;
  name: string;
  bookId?: BookId;
  selectedSymptoms: Symptom[];
  userId: string;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface SearchResult {
  remedy: Remedy;
  score: number;
  matchedSymptoms: string[];
}

export type FindRemedyRequest = ZodFindRemedyRequest;

export interface FindRemedyResponse {
  remedies: {
    id: string;
    name: string;
    description?: string;
    score: number;
    matchedSymptoms: string[];
    sourceBooks: string[];
  }[];
  totalMatches: number;
}
