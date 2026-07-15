'use client';

import type { RefObject, UIEvent } from 'react';
import { AlertCircle, BookOpen, Check, FileText, Loader2, Plus, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MotionGroup, MotionItem, MotionSection } from '@/components/ui/motion';
import { motionClassNames } from '@/lib/motion/system';
import { overlayBackdrop, overlayRecipes } from '@/lib/overlay/system';
import { cn, formatRemedyDisplayName } from '@/lib/utils';

export type FinderSymptom = {
  id: string;
  name: string;
  books?: string[];
};

export type FinderIndication = {
  name: string;
  books: string[];
  matchType?: 'exact' | 'mapping' | 'partial';
  originalQuery?: string;
  relevanceScore?: number;
};

export type FinderResult = {
  remedy: {
    id: string;
    name: string;
    book?: string;
  };
  score: number;
  matchedSymptoms: string[];
};

function prettyBook(bookId: string) {
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
}

function summarizeMatches(matches: string[]) {
  if (matches.length === 0) return null;

  const preview = matches.slice(0, 3);
  const remaining = matches.length - preview.length;

  return remaining > 0
    ? `${preview.join(' · ')} · +${remaining} more`
    : preview.join(' · ');
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

export function SymptomSearchView({
  activeBook,
  query,
  selectedSymptoms,
  results,
  totalResults,
  isSearching,
  isLoadingMore,
  showResults,
  showEmptyState,
  isOverlayOpen,
  inputRef,
  containedOverlay = false,
  readOnly = false,
  onOpenBooks,
  onOpenCases,
  onQueryChange,
  onOpenSearch,
  onDismissSearch,
  onClearQuery,
  onSymptomSelect,
  onResultsScroll,
}: Readonly<{
  activeBook: string;
  query: string;
  selectedSymptoms: FinderSymptom[];
  results: FinderIndication[];
  totalResults: number;
  isSearching: boolean;
  isLoadingMore: boolean;
  showResults: boolean;
  showEmptyState: boolean;
  isOverlayOpen: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  containedOverlay?: boolean;
  readOnly?: boolean;
  onOpenBooks: () => void;
  onOpenCases: () => void;
  onQueryChange: (value: string) => void;
  onOpenSearch: () => void;
  onDismissSearch: () => void;
  onClearQuery: () => void;
  onSymptomSelect: (symptom: string) => void;
  onResultsScroll: (event: UIEvent<HTMLDivElement>) => void;
}>) {
  const activeBookLabel = prettyBook(activeBook);

  return (
    <div className="relative space-y-4">
      {isOverlayOpen ? (
        <div
          aria-hidden="true"
          data-slot="search-backdrop"
          className={cn(
            overlayBackdrop(),
            'search-overlay-backdrop',
            containedOverlay && 'preview-search-backdrop',
          )}
          onPointerDown={onDismissSearch}
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

      <div className={cn('relative', isOverlayOpen && 'search-overlay-surface')}>
        <div className={`rounded-xl border border-border bg-card shadow-soft focus-within:border-primary ${motionClassNames.surface}`}>
          <div className="flex items-center gap-3 px-4 py-2 md:px-5">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <Input
              ref={inputRef}
              placeholder="Search symptom keywords…"
              value={query}
              readOnly={readOnly}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={onOpenSearch}
              onClick={onOpenSearch}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onDismissSearch();
              }}
              aria-label="Search symptom keywords"
              className="h-control flex-1 border-0 bg-transparent px-0 text-base shadow-none placeholder:text-muted-foreground focus-visible:border-0"
            />
            {isSearching ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" /> : null}
            {query ? (
              <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onClearQuery} aria-label="Clear search">
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        {showResults ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-3 flex flex-col items-center gap-3">
            <div className="w-full overflow-hidden rounded-xl border border-border bg-popover shadow-overlay">
              <div className="sticky top-0 border-b border-border bg-popover px-4 py-3 md:px-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">Matching indications</p>
                  <span className="index-label">
                    {totalResults.toLocaleString()} {totalResults === 1 ? 'indication' : 'indications'}
                  </span>
                </div>
              </div>

              <div className={overlayRecipes.picker.searchViewport} onScroll={onResultsScroll}>
                <div>
                  {results.map((result, index) => {
                    const isSelected = selectedSymptoms.some((symptom) => symptom.name === result.name);
                    const sourceBook = prettyBook(result.books[0] ?? activeBook);

                    return (
                      <button
                        key={`${result.name}-${index}`}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSymptomSelect(result.name)}
                        className={cn(
                          `group flex w-full items-start justify-between gap-4 border-b border-border px-4 py-3 text-left transition-colors md:px-6 ${motionClassNames.surface}`,
                          isSelected ? 'bg-accent' : 'hover:bg-surface-container-low',
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="block text-sm font-medium leading-relaxed text-foreground">{result.name}</span>
                            {result.matchType === 'mapping' && !isSelected ? <Badge variant="outline">Synonym</Badge> : null}
                          </div>
                          <p className="index-label">{sourceBook}</p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-center">
                          {isSelected ? (
                            <>
                              <Badge variant="default">Selected</Badge>
                              <Check className="h-4 w-4 text-primary" />
                            </>
                          ) : (
                            <Plus aria-hidden="true" className="h-4 w-4 text-on-surface-variant transition-colors group-hover:text-primary" />
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

            <SearchCloseButton onClick={onDismissSearch} />
          </div>
        ) : null}

        {showEmptyState && isOverlayOpen ? (
          <div data-slot="search-empty-overlay" className="absolute left-0 right-0 top-full z-50 mt-3 space-y-3">
            <Callout variant="default" className="text-sm">No symptoms found. Try a narrower phrase.</Callout>
            <div className="flex justify-center">
              <SearchCloseButton onClick={onDismissSearch} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SelectedSymptomsPanel({
  symptoms,
  activeBookName,
  className,
  onSaveCase,
  onClear,
  onRemove,
}: Readonly<{
  symptoms: FinderSymptom[];
  activeBookName: string;
  className?: string;
  onSaveCase: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}>) {
  if (symptoms.length === 0) return null;

  return (
    <MotionSection className={className}>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-border sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <CardTitle className="text-lg md:text-xl">Selected symptoms</CardTitle>
            <p className="index-label">
              {symptoms.length} {symptoms.length === 1 ? 'entry' : 'entries'} · {activeBookName}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button onClick={onSaveCase} variant="outline" size="sm" className="shrink-0">Save case</Button>
            <Button onClick={onClear} variant="ghost" size="sm" className="shrink-0">Clear all</Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {symptoms.map((symptom, index) => (
            <div key={symptom.id} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
              <div className="flex min-w-0 gap-3">
                <p aria-hidden="true" className="index-label select-none pt-0.5 text-primary">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="min-w-0 break-words text-sm leading-relaxed text-foreground">{symptom.name}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(symptom.id)} aria-label={`Remove ${symptom.name}`}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </MotionSection>
  );
}

export function ResultsPanel({
  results,
  activeBookName,
  selectedCount,
  className,
}: Readonly<{
  results: FinderResult[];
  activeBookName: string;
  selectedCount: number;
  className?: string;
}>) {
  if (results.length === 0) return null;

  return (
    <MotionSection className={className}>
      <Card>
        <CardHeader className="border-b border-border md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-xl md:text-2xl">Matching remedies</CardTitle>
            <p className="index-label">
              {results.length} {results.length === 1 ? 'remedy' : 'remedies'} · {activeBookName}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <Callout variant="info" icon={<AlertCircle className="h-4 w-4" />} className="text-sm">
            These results are for reference only. Consult a qualified practitioner before treatment.
          </Callout>

          <MotionGroup stagger={0.03}>
            {results.map((result) => {
              const sourceBook = result.remedy.book ? prettyBook(result.remedy.book) : activeBookName;
              const summary = summarizeMatches(result.matchedSymptoms);
              const matchLabel = selectedCount > 0
                ? `Matches ${result.score} of ${selectedCount}`
                : `${result.score} ${result.score === 1 ? 'match' : 'matches'}`;

              return (
                <MotionItem key={result.remedy.id}>
                  <div className="border-b border-border px-1 py-5 last:border-b-0">
                    <h3 className="text-lg font-medium text-foreground">{formatRemedyDisplayName(result.remedy.name)}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="default">{matchLabel}</Badge>
                      <Badge variant="outline">{sourceBook}</Badge>
                    </div>
                    {summary ? <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{summary}</p> : null}
                  </div>
                </MotionItem>
              );
            })}
          </MotionGroup>
        </CardContent>
      </Card>
    </MotionSection>
  );
}
