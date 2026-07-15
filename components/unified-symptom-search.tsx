"use client"

import { useCallback, useEffect, useRef, useState } from 'react';

import { SymptomSearchView, type FinderIndication } from '@/components/remedy-finder-view';
import { useSearchStore } from '@/lib/stores/search-store';
import { apiClient } from '@/lib/api/client';

interface UnifiedSymptomSearchProps {
  readonly onSymptomSelect: (symptom: string) => void;
  readonly selectedSymptoms?: Array<{ id: string; name: string; books?: string[] }>;
  readonly onOpenCases?: () => void;
  readonly onOpenBooks?: () => void;
  readonly onSearchActive?: (active: boolean) => void;
  readonly resetSignal?: number;
  readonly seededQuery?: { value: string; token: number } | null;
}

const PAGE_SIZE = 50;

export function UnifiedSymptomSearch({
  onSymptomSelect,
  selectedSymptoms = [],
  onOpenCases,
  onOpenBooks,
  onSearchActive,
  resetSignal,
  seededQuery,
}: UnifiedSymptomSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { activeBook } = useSearchStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showManualResults, setShowManualResults] = useState(false);
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false);
  const [isManualSearching, setIsManualSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [manualSearchResults, setManualSearchResults] = useState<FinderIndication[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const dismissSearch = useCallback(() => {
    setIsSearchOverlayOpen(false);
    setShowManualResults(false);
    setIsDropdownDismissed(true);
    inputRef.current?.blur();
  }, []);

  useEffect(() => {
    onSearchActive?.(query.trim().length > 0);
  }, [query, onSearchActive]);

  useEffect(() => {
    if (resetSignal === undefined) return;
    setQuery('');
    setDebouncedQuery('');
    setShowManualResults(false);
    setIsDropdownDismissed(false);
    setManualSearchResults([]);
    setTotalResults(0);
    setOffset(0);
    setIsSearchOverlayOpen(false);
  }, [resetSignal]);

  useEffect(() => {
    if (!seededQuery) return;
    setQuery(seededQuery.value);
    setIsDropdownDismissed(false);
    setIsSearchOverlayOpen(true);
    inputRef.current?.focus();
  }, [seededQuery]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => globalThis.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
        setManualSearchResults([]);
        setTotalResults(0);
        setOffset(0);
        return;
      }

      setIsManualSearching(true);
      setOffset(0);

      try {
        const data = await apiClient.searchSymptoms(debouncedQuery, activeBook, PAGE_SIZE, 0);
        setManualSearchResults(data.results || []);
        setTotalResults(data.total || 0);
        setOffset(PAGE_SIZE);
      } catch (error) {
        console.error('Error searching symptoms:', error);
        setManualSearchResults([]);
        setTotalResults(0);
      } finally {
        setIsManualSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, activeBook]);

  const loadMore = async () => {
    if (isLoadingMore || manualSearchResults.length >= totalResults) return;

    setIsLoadingMore(true);
    try {
      const data = await apiClient.searchSymptoms(debouncedQuery, activeBook, PAGE_SIZE, offset);
      setManualSearchResults((prev) => [...prev, ...(data.results || [])]);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more symptoms:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
  };

  useEffect(() => {
    setShowManualResults(
      !isDropdownDismissed &&
        debouncedQuery.trim().length >= 2 &&
        manualSearchResults.length > 0,
    );
  }, [debouncedQuery, manualSearchResults, isDropdownDismissed]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!showManualResults) return;
      const target = event.target as Node | null;
      if (!target) return;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setShowManualResults(false);
        setIsDropdownDismissed(true);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [showManualResults]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSearchOverlayOpen || event.key !== 'Escape') return;

      dismissSearch();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dismissSearch, isSearchOverlayOpen]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsDropdownDismissed(false);
  };

  const openDropdownIfAvailable = () => {
    setIsSearchOverlayOpen(true);
    setIsDropdownDismissed(false);
    if (debouncedQuery.trim().length >= 2 && manualSearchResults.length > 0) {
      setShowManualResults(true);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setDebouncedQuery('');
    setShowManualResults(false);
    setIsDropdownDismissed(false);
    setManualSearchResults([]);
    setTotalResults(0);
    setOffset(0);
  };

  const showEmptyState =
    debouncedQuery.trim().length >= 2 &&
    manualSearchResults.length === 0 &&
    !isManualSearching;

  return (
    <div ref={containerRef}>
      <SymptomSearchView
        activeBook={activeBook}
        query={query}
        selectedSymptoms={selectedSymptoms}
        results={manualSearchResults}
        totalResults={totalResults}
        isSearching={isManualSearching}
        isLoadingMore={isLoadingMore}
        showResults={showManualResults}
        showEmptyState={showEmptyState}
        isOverlayOpen={isSearchOverlayOpen}
        inputRef={inputRef}
        onOpenBooks={onOpenBooks ?? (() => undefined)}
        onOpenCases={onOpenCases ?? (() => undefined)}
        onQueryChange={handleInputChange}
        onOpenSearch={openDropdownIfAvailable}
        onDismissSearch={dismissSearch}
        onClearQuery={clearQuery}
        onSymptomSelect={onSymptomSelect}
        onResultsScroll={handleScroll}
      />
    </div>
  );
}
