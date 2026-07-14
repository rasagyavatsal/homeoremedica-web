"use client"

import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2, Search, BookOpen, Check, Plus, X, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Callout } from '@/components/ui/callout';
import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/lib/stores/search-store';
import { apiClient } from '@/lib/api/client';
import { motionClassNames } from '@/lib/motion/system';
import { overlayBackdrop, overlayRecipes } from '@/lib/overlay/system';
import { cn } from '@/lib/utils';

interface UnifiedSymptomSearchProps {
  readonly onSymptomSelect: (symptom: string) => void;
  readonly selectedSymptoms?: Array<{ id: string; name: string; books?: string[] }>;
  readonly onOpenCases?: () => void;
  readonly onOpenBooks?: () => void;
  readonly onSearchActive?: (active: boolean) => void;
  readonly resetSignal?: number;
  readonly seededQuery?: { value: string; token: number } | null;
}

interface SymptomResult {
  name: string;
  books: string[];
  matchType?: 'exact' | 'mapping' | 'partial';
  originalQuery?: string;
  relevanceScore?: number;
}

const PAGE_SIZE = 50;

function prettyBook(bookId: string) {
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
}

function SearchCloseButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-full bg-popover shadow-overlay"
      onClick={onClick}
      aria-label="Close search"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}

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
  const [manualSearchResults, setManualSearchResults] = useState<SymptomResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const activeBookLabel = prettyBook(activeBook);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
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

  const handleSymptomClick = (symptom: string) => {
    onSymptomSelect(symptom);
  };

  const showEmptyState =
    debouncedQuery.trim().length >= 2 &&
    manualSearchResults.length === 0 &&
    !isManualSearching;

  return (
    <div ref={containerRef} className="space-y-4">
      {isSearchOverlayOpen ? (
        <div
          aria-hidden="true"
          data-slot="search-backdrop"
          className={cn(overlayBackdrop(), 'search-overlay-backdrop')}
          onPointerDown={dismissSearch}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onOpenBooks}
          aria-label={`Source ${activeBookLabel}`}
        >
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-on-surface-variant">Source</span>
          <span className="font-semibold text-foreground">{activeBookLabel}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={onOpenCases}
        >
          <FileText className="h-4 w-4" />
          <span>Saved cases</span>
        </Button>
      </div>

      <div className={cn('relative', isSearchOverlayOpen && 'search-overlay-surface')}>
        <div className={`rounded-xl border border-border bg-card shadow-soft focus-within:border-primary ${motionClassNames.surface}`}>
          <div className="flex items-center gap-3 px-4 py-2 md:px-5">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <Input
              ref={inputRef}
              placeholder="Search symptom keywords…"
              value={query}
              onChange={handleInputChange}
              onFocus={openDropdownIfAvailable}
              onClick={openDropdownIfAvailable}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  dismissSearch();
                }
              }}
              aria-label="Search symptom keywords"
              className="h-control flex-1 border-0 bg-transparent px-0 text-base shadow-none placeholder:text-muted-foreground focus-visible:border-0"
            />
            {isManualSearching ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
            ) : null}
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={clearQuery}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        {showManualResults ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-3 flex flex-col items-center gap-3">
            <div className="w-full overflow-hidden rounded-xl border border-border bg-popover shadow-overlay">
              <div className="sticky top-0 border-b border-border bg-popover px-4 py-3 md:px-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    Matching indications
                  </p>
                  <span className="index-label">
                    {totalResults.toLocaleString()} {totalResults === 1 ? 'indication' : 'indications'}
                  </span>
                </div>
              </div>

              <div className={overlayRecipes.picker.searchViewport} onScroll={handleScroll}>
                <div>
                  {manualSearchResults.map((result, index) => {
                    const isSelected = selectedSymptoms.some((symptom) => symptom.name === result.name);
                    const sourceBook = prettyBook(result.books[0] ?? activeBook);

                    return (
                      <button
                        key={`${result.name}-${index}`}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSymptomClick(result.name)}
                        className={cn(
                          `group flex w-full items-start justify-between gap-4 border-b border-border px-4 py-3 text-left transition-colors md:px-6 ${motionClassNames.surface}`,
                          isSelected
                            ? 'bg-accent'
                            : 'hover:bg-surface-container-low',
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="block text-sm font-medium leading-relaxed text-foreground">
                              {result.name}
                            </span>
                            {result.matchType === 'mapping' && !isSelected ? (
                              <Badge variant="outline">
                                Synonym
                              </Badge>
                            ) : null}
                          </div>
                          <p className="index-label">
                            {sourceBook}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-center">
                          {isSelected ? (
                            <>
                              <Badge variant="default">Selected</Badge>
                              <Check className="h-4 w-4 text-primary" />
                            </>
                          ) : (
                            <Plus
                              aria-hidden="true"
                              className="h-4 w-4 text-on-surface-variant transition-colors group-hover:text-primary"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isLoadingMore ? (
                  <div className="flex justify-center py-5">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : null}
              </div>
            </div>

            <SearchCloseButton onClick={dismissSearch} />
          </div>
        ) : null}

        {showEmptyState && isSearchOverlayOpen ? (
          <div className="mt-3 space-y-3">
            <Callout variant="default" className="text-sm">
              No symptoms found. Try a narrower phrase.
            </Callout>
            <div className="flex justify-center">
              <SearchCloseButton onClick={dismissSearch} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
