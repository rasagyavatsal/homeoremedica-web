import { Timestamp } from 'firebase-admin/firestore';
import type { SearchBookId } from '@/lib/seo/book-data';

// User document in Firestore - simplified (app is free)
export interface UserDoc {
  email: string;
  name?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Note: UsageDoc removed - app is now free for all users, no usage tracking needed

export interface CaseSymptomData {
  id: string;
  name: string;
  synonyms?: string[];
  books?: SearchBookId[];
  category?: string;
}

export interface CaseResultData {
  remedyId: string;
  score: number;
}

// Case document in Firestore
export interface CaseDoc {
  title?: string;
  name?: string;
  note?: string;
  bookId?: SearchBookId;
  symptoms?: string[];
  selectedSymptoms?: CaseSymptomData[];
  results?: CaseResultData[];
  userId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  timestamp?: Timestamp;
}

export interface SerializedCase {
  id: string;
  title: string;
  name: string;
  note: string;
  bookId?: SearchBookId | null;
  symptoms: string[];
  selectedSymptoms: CaseSymptomData[];
  results: CaseResultData[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  timestamp: string;
}

// API Response types
export interface AuthSessionResponse {
  user: {
    uid: string;
    email: string;
  };
}

export interface FindRemedyRequest {
  bookId: SearchBookId;
  symptoms: string[];
}

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

// Error response types
export interface ApiError {
  code: 'APP_CHECK_REQUIRED' | 'AUTH_REQUIRED' | 'INVALID_INPUT' | 'INTERNAL_ERROR' | 'NOT_FOUND';
  message: string;
  details?: any;
}

// Remedy matching types
export interface RemedyMatch {
  remedyId: string;
  score: number;
  matchedSymptoms: string[];
  sourceBooks: string[];
}

export interface SymptomIndex {
  [symptomName: string]: {
    id: string;
    synonyms: string[];
    books: string[];
  };
}

export interface BookIndex {
  [bookId: string]: Set<string>; // symptom IDs
}

export interface RemedyIndex {
  [remedyId: string]: {
    name: string;
    description?: string;
    symptoms: string[];
    book: string;
  };
}
