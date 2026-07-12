import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchStore } from '../search-store';

// Mock fetch
globalThis.fetch = vi.fn();

describe('SearchStore Integration with ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear storage mock from setup
    localStorage.clear();
    
    useSearchStore.getState().clearSymptoms();
    useSearchStore.getState().clearResults();
  });

  it('should call the API and update results when findRemedies is called', async () => {
    const mockResults = [
      { remedyId: 'arnica', score: 10, matchedSymptoms: ['bruise'], sourceBooks: ['boericke'] },
    ];

    vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockResults)));

    const store = useSearchStore.getState();
    store.addSymptom({ id: 's1', name: 'bruise' });
    
    await store.findRemedies();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/remedies/search'),
      expect.any(Object)
    );

    const updatedState = useSearchStore.getState();
    expect(updatedState.results).toEqual(mockResults);
  });

  it('should reset isSearching on API error', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network failure'));

    const store = useSearchStore.getState();
    store.addSymptom({ id: 's1', name: 'bruise' });
    
    await store.findRemedies();

    const state = useSearchStore.getState();
    expect(state.searchStatus.isSearching).toBe(false);
    expect(state.results).toEqual([]);
  });

  it('should not call fetch if no symptoms are selected', async () => {
    const store = useSearchStore.getState();
    // Ensure symptoms are empty
    store.clearSymptoms();
    
    await store.findRemedies();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(useSearchStore.getState().results).toEqual([]);
  });
});
