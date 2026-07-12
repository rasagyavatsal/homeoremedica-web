import { dbAll, dbGet } from '@/lib/db/client';
import { createRepertorySearchService, SearchResult, Remedy, BookId } from '@homeoremedica/shared';
import { FindRemedyResponse } from '@/lib/types/backend';

export const searchService = createRepertorySearchService({
  all: dbAll,
  get: async <T>(sql: string, params?: any[]) => {
    const result = await dbGet<T>(sql, params);
    return result ?? null;
  }
});

export async function searchSymptomsForApi(book: string, query: string, limit: number, offset: number) {
  if (!query || query.length < 2) {
    return { results: [], total: 0 };
  }

  const resultsRaw = await searchService.suggestSymptoms(book, query, limit, offset);
  const total = await searchService.countSymptomSuggestions(book, query);

  const normalizedQuery = query.toLowerCase().trim();
  const originalWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

  const results = resultsRaw.map((text: string, index: number) => {
    const symptomLower = text.toLowerCase();
    const exactMatchCount = originalWords.filter(word => symptomLower.includes(word)).length;
    
    let matchType: 'exact' | 'mapping' | 'partial' = 'partial';
    if (symptomLower === normalizedQuery) {
      matchType = 'exact';
    } else if (exactMatchCount < originalWords.length) {
      matchType = 'mapping';
    }

    return {
      name: text,
      books: [book],
      matchType,
      relevanceScore: resultsRaw.length - index
    };
  });

  return { results, total };
}

export async function searchRemediesForApi(book: string, symptoms: string[]): Promise<SearchResult[]> {
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return [];
  }

  const matches = await searchService.findRemedies(book, symptoms);

  const searchResults: SearchResult[] = await Promise.all(matches.slice(0, 20).map(async (match: any) => {
    const details = await searchService.getRemedyDetails(`${match.slug}-${book}`);
    
    const remedy: Remedy = {
      id: match.slug,
      name: match.remedy,
      description: details?.description || '',
      symptoms: details?.symptoms || [],
      book: book as BookId
    };

    return {
      remedy,
      score: match.matchedSymptoms.length,
      matchedSymptoms: match.matchedSymptoms
    };
  }));

  return searchResults;
}

export async function findRemedyResponseForApi(bookId: string, symptoms: string[]): Promise<FindRemedyResponse> {
  const rawMatches = await searchService.findRemedies(bookId, symptoms);
  
  const remedies = await Promise.all(rawMatches.slice(0, 20).map(async (match: any) => {
    const details = await searchService.getRemedyDetails(`${match.slug}-${bookId}`);
    return {
      id: `${match.slug}-${bookId}`,
      name: details?.name || match.remedy || 'Unknown',
      description: details?.description,
      score: match.matchedSymptoms.length,
      matchedSymptoms: match.matchedSymptoms,
      sourceBooks: [bookId]
    };
  }));
  
  return {
    remedies,
    totalMatches: rawMatches.length
  };
}
