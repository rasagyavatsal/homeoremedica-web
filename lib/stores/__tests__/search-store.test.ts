import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchStore } from '../search-store';
import { apiClient } from '../../api/client';

// Mock the API client
vi.mock('../../api/client', () => ({
  apiClient: {
    searchRemedies: vi.fn(),
  },
}));

describe('useSearchStore unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchStore.getState().clearSymptoms();
    useSearchStore.getState().clearResults();
    useSearchStore.getState().setActiveBook('boericke');
    useSearchStore.getState().setSearchQuery('');
  });

  it('should initialize with default state', () => {
    const state = useSearchStore.getState();
    expect(state.activeBook).toBe('boericke');
    expect(state.selectedSymptoms).toEqual([]);
    expect(state.results).toEqual([]);
    expect(state.searchQuery).toBe('');
    expect(state.searchStatus.isSearching).toBe(false);
  });

  it('should set active book and clear results', () => {
    const store = useSearchStore.getState();
    store.addSymptom({ id: 's1', name: 'S1' });
    store.setActiveBook('clarke');
    
    const state = useSearchStore.getState();
    expect(state.activeBook).toBe('clarke');
    expect(state.selectedSymptoms).toEqual([]);
    expect(state.results).toEqual([]);
  });

  it('should add a symptom and clear results', () => {
    const store = useSearchStore.getState();
    useSearchStore.setState({ results: [{ remedyId: 'r1', score: 10 }] as any });
    
    store.addSymptom({ id: 's1', name: 'S1' });
    
    const state = useSearchStore.getState();
    expect(state.selectedSymptoms).toEqual([{ id: 's1', name: 'S1' }]);
    expect(state.results).toEqual([]);
  });

  it('should replace symptom if ID matches', () => {
    const store = useSearchStore.getState();
    store.addSymptom({ id: 's1', name: 'Old' });
    store.addSymptom({ id: 's1', name: 'New' });
    
    expect(useSearchStore.getState().selectedSymptoms).toEqual([{ id: 's1', name: 'New' }]);
  });

  it('should remove a symptom and clear results', () => {
    const store = useSearchStore.getState();
    store.addSymptom({ id: 's1', name: 'S1' });
    useSearchStore.setState({ results: [{ remedyId: 'r1', score: 10 }] as any });

    store.removeSymptom('s1');
    
    const state = useSearchStore.getState();
    expect(state.selectedSymptoms).toEqual([]);
    expect(state.results).toEqual([]);
  });

  it('should clear all symptoms and results', () => {
    const store = useSearchStore.getState();
    store.addSymptom({ id: 's1', name: 'S1' });
    useSearchStore.setState({ results: [{ remedyId: 'r1', score: 10 }] as any });

    store.clearSymptoms();
    
    const state = useSearchStore.getState();
    expect(state.selectedSymptoms).toEqual([]);
    expect(state.results).toEqual([]);
  });

  it('should clear only results', () => {
    const store = useSearchStore.getState();
    store.addSymptom({ id: 's1', name: 'S1' });
    useSearchStore.setState({ results: [{ remedyId: 'r1', score: 10 }] as any });

    store.clearResults();
    
    const state = useSearchStore.getState();
    expect(state.selectedSymptoms).toEqual([{ id: 's1', name: 'S1' }]);
    expect(state.results).toEqual([]);
  });

  it('should set search query', () => {
    const store = useSearchStore.getState();
    store.setSearchQuery('test query');
    expect(useSearchStore.getState().searchQuery).toBe('test query');
  });

  describe('findRemedies', () => {
    it('should not call API if no symptoms are selected', async () => {
      await useSearchStore.getState().findRemedies();
      expect(apiClient.searchRemedies).not.toHaveBeenCalled();
      expect(useSearchStore.getState().results).toEqual([]);
    });

    it('should call API and update results on success', async () => {
      const mockResults = [{ remedyId: 'r1', score: 10 }];
      vi.mocked(apiClient.searchRemedies).mockResolvedValue(mockResults as any);
      
      const store = useSearchStore.getState();
      store.addSymptom({ id: 's1', name: 'S1' });
      
      await store.findRemedies();
      
      const state = useSearchStore.getState();
      expect(apiClient.searchRemedies).toHaveBeenCalledWith(['S1'], 'boericke');
      expect(state.results).toEqual(mockResults);
      expect(state.searchStatus.isSearching).toBe(false);
      expect(state.searchStatus.progress).toBe(100);
    });

    it('should reset isSearching on API error', async () => {
      vi.mocked(apiClient.searchRemedies).mockRejectedValue(new Error('API Error'));
      
      const store = useSearchStore.getState();
      store.addSymptom({ id: 's1', name: 'S1' });
      
      await store.findRemedies();
      
      const state = useSearchStore.getState();
      expect(state.searchStatus.isSearching).toBe(false);
      expect(state.results).toEqual([]);
    });

    it('should ignore stale results when symptoms change during automatic matching', async () => {
      let resolveFirst!: (results: any[]) => void;
      let resolveSecond!: (results: any[]) => void;
      vi.mocked(apiClient.searchRemedies)
        .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
        .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

      const store = useSearchStore.getState();
      store.addSymptom({ id: 's1', name: 'S1' });
      const firstSearch = store.findRemedies();

      store.addSymptom({ id: 's2', name: 'S2' });
      const secondSearch = store.findRemedies();

      const currentResults = [{ remedyId: 'current', score: 2 }];
      resolveSecond(currentResults);
      await secondSearch;

      resolveFirst([{ remedyId: 'stale', score: 1 }]);
      await firstSearch;

      expect(useSearchStore.getState().results).toEqual(currentResults);
    });

    it('should clear search status when a pending search is invalidated', async () => {
      let resolveSearch!: (results: any[]) => void;
      vi.mocked(apiClient.searchRemedies).mockImplementationOnce(
        () => new Promise((resolve) => { resolveSearch = resolve; }),
      );

      const store = useSearchStore.getState();
      store.addSymptom({ id: 's1', name: 'S1' });
      const pendingSearch = store.findRemedies();

      expect(useSearchStore.getState().searchStatus.isSearching).toBe(true);

      store.clearSymptoms();

      expect(useSearchStore.getState().searchStatus.isSearching).toBe(false);

      resolveSearch([{ remedyId: 'stale', score: 1 }]);
      await pendingSearch;

      expect(useSearchStore.getState().searchStatus.isSearching).toBe(false);
      expect(useSearchStore.getState().results).toEqual([]);
    });
  });

  describe('migration', () => {
    it('should migrate legacy activeBook "all" to "boericke"', () => {
      // Find the persist config to access the migrate function
      const persistOptions = useSearchStore.persist.getOptions();
      const migrate = persistOptions.migrate;
      
      if (!migrate) throw new Error('Migrate function not found');
      
      const oldState = { activeBook: 'all', selectedSymptoms: [] };
      const migrated = migrate(oldState, 1);
      
      expect((migrated as any).activeBook).toBe('boericke');
    });

    it('should not change valid activeBook', () => {
      const persistOptions = useSearchStore.persist.getOptions();
      const migrate = persistOptions.migrate;
      
      if (!migrate) throw new Error('Migrate function not found');
      
      const validState = { activeBook: 'clarke', selectedSymptoms: [] };
      const migrated = migrate(validState, 1);
      
      expect((migrated as any).activeBook).toBe('clarke');
    });
  });
});
