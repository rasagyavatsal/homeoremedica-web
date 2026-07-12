import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../client';

// Use vi.spyOn to mock the request method
describe('WebApiClient', () => {
  let requestSpy: any;

  beforeEach(() => {
    requestSpy = vi.spyOn(apiClient as any, 'request');
    requestSpy.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call searchRemedies with correct parameters', async () => {
    const symptoms = ['itching', 'fever'];
    const book = 'boericke';
    
    await apiClient.searchRemedies(symptoms, book);

    expect(requestSpy).toHaveBeenCalledWith('/remedies/search', {
      method: 'POST',
      body: JSON.stringify({ symptoms, book }),
    });
  });

  it('should call searchSymptoms with correct parameters and URL encoding', async () => {
    const query = 'itching & burning';
    const book = 'clarke';
    const limit = 50;
    const offset = 10;
    
    await apiClient.searchSymptoms(query, book, limit, offset);

    const expectedUrl = `/symptoms/search?query=${encodeURIComponent(query)}&book=${book}&limit=${limit}&offset=${offset}`;
    expect(requestSpy).toHaveBeenCalledWith(expectedUrl);
  });
});
