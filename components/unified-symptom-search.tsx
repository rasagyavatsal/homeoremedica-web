"use client"

import { useEffect, useRef, useState } from 'react';

import { Loader2, Search, BookOpen, Check, Plus, X, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Callout } from '@/components/ui/callout';
import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/lib/stores/search-store';
import { apiClient } from '@/lib/api/client';
import { motionClassNames } from '@/lib/motion/system';
import { overlayRecipes } from '@/lib/overlay/system';
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

  const activeBookLabel = prettyBook(activeBook);

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
  }, [resetSignal]);

  useEffect(() => {
    if (!seededQuery) return;
    setQuery(seededQuery.value);
    setIsDropdownDismissed(false);
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
      if (!showManualResults || event.key !== 'Escape') return;

      setShowManualResults(false);
      setIsDropdownDismissed(true);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showManualResults]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setIsDropdownDismissed(false);
  };

  const openDropdownIfAvailable = () => {
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

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 px-3"
          onClick={onOpenBooks}
          aria-label={`Source ${activeBookLabel}`}
        >
          <BookOpen className="h-4 w-4 text-tertiary" />
          <span className="text-on-surface-variant">Source</span>
          <span className="font-semibold text-foreground">{activeBookLabel}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 px-3"
          onClick={onOpenCases}
        >
          <FileText className="h-4 w-4" />
          <span>Saved cases</span>
        </Button>
      </div>

      <div className="relative">
        <div className={`rounded-sm border border-foreground/30 bg-card transition-colors focus-within:border-foreground/60 ${motionClassNames.surface}`}>
          <div className="flex items-center gap-3 px-4 py-4 md:px-5">
            <Search className="h-5 w-5 shrink-0 text-tertiary" />
            <Input
              ref={inputRef}
              placeholder="Search symptom keywords…"
              value={query}
              onChange={handleInputChange}
              onFocus={openDropdownIfAvailable}
              onClick={openDropdownIfAvailable}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setShowManualResults(false);
                  setIsDropdownDismissed(true);
                }
              }}
              className="h-11 flex-1 border-0 bg-transparent px-0 text-base placeholder:text-on-surface-variant/55 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 md:text-lg"
            />
            {isManualSearching ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-tertiary" />
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
          <div className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-sm border border-foreground/30 bg-card">
            <div className="sticky top-0 border-b-2 border-foreground/70 bg-card px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-sm font-medium tracking-display text-foreground">
                  Matching indications
                </p>
                <span className="font-code text-[10px] tracking-[0.08em] text-on-surface-variant">
                  {totalResults.toLocaleString()} {totalResults === 1 ? 'indication' : 'indications'}
                </span>
              </div>
            </div>

            <div className={overlayRecipes.picker.viewport} onScroll={handleScroll}>
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
                        `group flex w-full items-start justify-between gap-4 border-b border-border/25 px-4 py-3 text-left transition-colors ${motionClassNames.surface}`,
                        isSelected
                          ? 'border-l-[3px] border-l-primary bg-primary/[0.07]'
                          : 'border-l-[3px] border-l-transparent hover:bg-foreground/[0.04]',
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
                        <p className="font-code text-[10px] tracking-[0.08em] text-on-surface-variant">
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
                            className="h-4 w-4 text-on-surface-variant/45 transition-colors group-hover:text-tertiary"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isLoadingMore ? (
                <div className="flex justify-center py-5">
                  <Loader2 className="h-5 w-5 animate-spin text-tertiary" />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {query.trim().length === 0 ? (
        <p className="px-1 font-code text-xs leading-relaxed text-on-surface-variant/80">
          Keywords match best — “itching bed”, not “itching when in the bed”.
        </p>
      ) : null}

      {debouncedQuery.trim().length >= 2 && manualSearchResults.length === 0 && !isManualSearching ? (
        <Callout variant="default" className="text-sm">
          No symptoms found. Try a narrower phrase.
        </Callout>
      ) : null}
    </div>
  );
}
