import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, SearchResult, Symptom } from '@/types';
import { apiClient } from '@/lib/api/client';

type SearchBookId = Book['id'];

interface SearchState {
  activeBook: SearchBookId;
  selectedSymptoms: Symptom[];
  results: SearchResult[];
  searchQuery: string;
  searchStatus: {
    isSearching: boolean;
    currentBook?: SearchBookId;
    completedBooks: SearchBookId[];
    progress: number; // 0-100
    totalBooks: number;
  };
  
  setActiveBook: (book: SearchBookId) => void;
  addSymptom: (symptom: Symptom) => void;
  removeSymptom: (symptomId: string) => void;
  clearSymptoms: () => void;
  clearResults: () => void;
  setSearchQuery: (query: string) => void;
  findRemedies: () => Promise<void>;
}

function clearSearchStatus(status: SearchState['searchStatus']): SearchState['searchStatus'] {
  return {
    ...status,
    isSearching: false,
    currentBook: undefined,
    completedBooks: [],
    progress: 0,
  };
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => {
      let searchVersion = 0;
      const invalidatePendingSearch = () => {
        searchVersion += 1;
      };

      return {
        activeBook: 'boericke',
        selectedSymptoms: [],
        results: [],
        searchQuery: '',
        searchStatus: {
          isSearching: false,
          currentBook: undefined,
          completedBooks: [],
          progress: 0,
          totalBooks: 4,
        },
      
        setActiveBook: (book) => {
          invalidatePendingSearch();
          set((state) => ({
            activeBook: book,
            selectedSymptoms: [],
            results: [],
            searchStatus: clearSearchStatus(state.searchStatus),
          }));
        },

        addSymptom: (symptom) => {
          invalidatePendingSearch();
          set((state) => ({
            selectedSymptoms: [...state.selectedSymptoms.filter(s => s.id !== symptom.id), symptom],
            results: [],
            searchStatus: clearSearchStatus(state.searchStatus),
          }));
        },

        removeSymptom: (symptomId) => {
          invalidatePendingSearch();
          set((state) => ({
            selectedSymptoms: state.selectedSymptoms.filter(s => s.id !== symptomId),
            results: [],
            searchStatus: clearSearchStatus(state.searchStatus),
          }));
        },

        clearSymptoms: () => {
          invalidatePendingSearch();
          set((state) => ({
            selectedSymptoms: [],
            results: [],
            searchStatus: clearSearchStatus(state.searchStatus),
          }));
        },

        clearResults: () => {
          invalidatePendingSearch();
          set((state) => ({
            results: [],
            searchStatus: clearSearchStatus(state.searchStatus),
          }));
        },

        setSearchQuery: (query) => set({ searchQuery: query }),

        /**
         * Remedy Matching Algorithm: Set Intersection with Count-Based Ranking
         *
         * Now uses server-side SQLite via API
         */
        findRemedies: async () => {
          const state = get();
          const { selectedSymptoms, activeBook } = state;

          if (selectedSymptoms.length === 0) {
            set({ results: [] });
            return;
          }

          const requestVersion = ++searchVersion;

          set({
            searchStatus: {
              isSearching: true,
              currentBook: activeBook,
              completedBooks: [],
              progress: 10,
              totalBooks: 1,
            },
          });

          try {
            const results = await apiClient.searchRemedies(
              selectedSymptoms.map(s => s.name),
              activeBook,
            );

            if (requestVersion !== searchVersion) return;

            set((s) => ({
              results,
              searchStatus: {
                ...s.searchStatus,
                isSearching: false,
                currentBook: undefined,
                completedBooks: [activeBook],
                progress: 100,
              },
            }));
          } catch (error) {
            if (requestVersion !== searchVersion) return;

            console.error('Search error:', error);
            set((s) => ({
              searchStatus: {
                ...s.searchStatus,
                isSearching: false,
                currentBook: undefined,
              },
            }));
          }
        },
      };
    },
    {
      name: 'search-storage',
      version: 2,
      migrate: (persistedState: any, version) => {
        // Coerce legacy 'all' to a specific default book
        if (persistedState?.activeBook === 'all') {
          persistedState.activeBook = 'boericke';
        }
        return persistedState;
      }
    }
  )
);
