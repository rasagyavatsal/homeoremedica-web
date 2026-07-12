import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchSymptomsForApi, searchRemediesForApi, findRemedyResponseForApi } from './service';

vi.mock('@homeoremedica/shared', () => ({
  createRepertorySearchService: vi.fn().mockReturnValue({
    suggestSymptoms: vi.fn(),
    countSymptomSuggestions: vi.fn(),
    findRemedies: vi.fn(),
    getRemedyDetails: vi.fn(),
  }),
}));

vi.mock('@/lib/db/client', () => ({
  dbAll: vi.fn(),
  dbGet: vi.fn(),
}));

import { createRepertorySearchService } from '@homeoremedica/shared';

describe('Server Repertory Service', () => {
  let mockSearchService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchService = (createRepertorySearchService as any)();
  });

  describe('searchSymptomsForApi', () => {
    it('should return empty results when query is too short', async () => {
      const result = await searchSymptomsForApi('book', 'a', 50, 0);
      expect(result).toEqual({ results: [], total: 0 });
    });

    it('should shape symptom results correctly', async () => {
      mockSearchService.suggestSymptoms.mockResolvedValue(['head pain', 'headache']);
      mockSearchService.countSymptomSuggestions.mockResolvedValue(2);

      const result = await searchSymptomsForApi('book', 'head', 50, 0);
      
      expect(result.total).toBe(2);
      expect(result.results).toEqual([
        {
          name: 'head pain',
          books: ['book'],
          matchType: 'partial',
          relevanceScore: 2
        },
        {
          name: 'headache',
          books: ['book'],
          matchType: 'partial',
          relevanceScore: 1
        }
      ]);
    });

    it('should identify exact match', async () => {
      mockSearchService.suggestSymptoms.mockResolvedValue(['headache']);
      mockSearchService.countSymptomSuggestions.mockResolvedValue(1);

      const result = await searchSymptomsForApi('book', 'headache', 50, 0);
      
      expect(result.results[0].matchType).toBe('exact');
    });
  });

  describe('searchRemediesForApi', () => {
    it('should shape search results with details', async () => {
      mockSearchService.findRemedies.mockResolvedValue([
        { slug: 'bell', remedy: 'Belladonna', matchedSymptoms: ['s1'] }
      ]);
      mockSearchService.getRemedyDetails.mockResolvedValue({
        description: 'Desc',
        symptoms: ['s1', 's2']
      });

      const result = await searchRemediesForApi('book', ['s1']);

      expect(result).toEqual([{
        remedy: {
          id: 'bell',
          name: 'Belladonna',
          description: 'Desc',
          symptoms: ['s1', 's2'],
          book: 'book'
        },
        score: 1,
        matchedSymptoms: ['s1']
      }]);
    });

    it('should limit to top 20 matches', async () => {
      const mockMatches = Array.from({ length: 25 }, (_, i) => ({
        slug: `rem${i}`,
        remedy: `Remedy ${i}`,
        matchedSymptoms: ['s1']
      }));
      mockSearchService.findRemedies.mockResolvedValue(mockMatches);
      mockSearchService.getRemedyDetails.mockResolvedValue({});

      const result = await searchRemediesForApi('book', ['s1']);

      expect(result.length).toBe(20);
    });
  });

  describe('findRemedyResponseForApi', () => {
    it('should shape find remedy response with total matches and details', async () => {
      const mockMatches = Array.from({ length: 25 }, (_, i) => ({
        slug: `rem${i}`,
        remedy: `Remedy ${i}`,
        matchedSymptoms: ['s1']
      }));
      mockSearchService.findRemedies.mockResolvedValue(mockMatches);
      mockSearchService.getRemedyDetails.mockResolvedValue({
        description: 'Desc',
        name: 'Detailed Name'
      });

      const result = await findRemedyResponseForApi('book', ['s1']);

      expect(result.totalMatches).toBe(25);
      expect(result.remedies.length).toBe(20);
      expect(result.remedies[0]).toEqual({
        id: 'rem0-book',
        name: 'Detailed Name',
        description: 'Desc',
        score: 1,
        matchedSymptoms: ['s1'],
        sourceBooks: ['book']
      });
    });
  });
});
