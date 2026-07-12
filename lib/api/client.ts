import { ApiClient, SearchResult } from '@homeoremedica/shared';

class WebApiClient extends ApiClient {
  // Search remedies (used by search-store.ts) — web-only
  async searchRemedies(symptoms: string[], book: string): Promise<SearchResult[]> {
    return this.request<SearchResult[]>('/remedies/search', {
      method: 'POST',
      body: JSON.stringify({ symptoms, book }),
    });
  }

  // Search symptoms (used by unified-symptom-search.tsx) — web-only
  async searchSymptoms(query: string, book: string, limit: number, offset: number): Promise<{ results: any[], total: number }> {
    return this.request<{ results: any[], total: number }>(`/symptoms/search?query=${encodeURIComponent(query)}&book=${book}&limit=${limit}&offset=${offset}`);
  }
}

export const apiClient = new WebApiClient('/api');
