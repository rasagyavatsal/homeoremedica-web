'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

import { CasesDialog } from '@/components/cases-dialog';
import { FinderWorkspace } from '@/components/finder-workspace';
import {
  SymptomSearchView,
  type FinderIndication,
  type FinderResult,
} from '@/components/remedy-finder-view';
import { SaveCaseDialog } from '@/components/save-case-dialog';
import { SourceDialog } from '@/components/source-dialog';
import { getBookName, SEARCH_BOOKS } from '@/lib/seo/book-data';
import type { BookId, Case } from '@/types';

const PREVIEW_CASE_DETAILS = [
  ['night-time-burning-pain', 'Priya, 40 F', 'boericke-MM', '2026-07-12T00:00:00.000Z'],
  ['dry-cough-follow-up', 'Ethan, 26 M', 'clarke-MM', '2026-07-08T00:00:00.000Z'],
  ['sunlight-headache', 'Meera, 34 F', 'kent-lectures', '2026-06-29T00:00:00.000Z'],
] as const satisfies ReadonlyArray<readonly [string, string, BookId, string]>;

const PREVIEW_CASE_SYMPTOMS = [
  ['night-time-burning-pain', 'burning-pain', 'Burning pains, worse at night'],
  ['night-time-burning-pain', 'restlessness', 'Restlessness after midnight'],
  ['night-time-burning-pain', 'thirst', 'Thirst for small quantities'],
  ['dry-cough-follow-up', 'dry-cough', 'Dry cough, worse after midnight'],
  ['dry-cough-follow-up', 'larynx', 'Tickling in the larynx'],
  ['dry-cough-follow-up', 'cold-air', 'Cough aggravated by cold air'],
  ['sunlight-headache', 'throbbing', 'Throbbing pain in the temples'],
  ['sunlight-headache', 'bright-light', 'Headache aggravated by bright light'],
  ['sunlight-headache', 'heat-head', 'Heat of the head with cold extremities'],
] as const;

const PREVIEW_RESULTS = {
  'boericke-MM': [
    ['arsenicum-album', 'Arsenicum album', 3, ['Burning pains', 'Restlessness', 'Thirst']],
    ['phosphorus', 'Phosphorus', 2, ['Burning pains', 'Thirst']],
    ['sulphur', 'Sulphur', 2, ['Burning pains', 'Worse at night']],
  ],
  'clarke-MM': [
    ['drosera-rotundifolia', 'Drosera rotundifolia', 3, ['Dry cough', 'After midnight', 'Laryngeal tickling']],
    ['bryonia-alba', 'Bryonia alba', 2, ['Dry cough', 'Cold air']],
    ['phosphorus', 'Phosphorus', 2, ['Dry cough', 'Laryngeal tickling']],
  ],
  'kent-lectures': [
    ['belladonna', 'Belladonna', 3, ['Throbbing pain', 'Bright light', 'Heat of head']],
    ['glonoinum', 'Glonoinum', 2, ['Throbbing pain', 'Sun exposure']],
    ['natrum-muriaticum', 'Natrum muriaticum', 2, ['Headache', 'Bright light']],
  ],
  'allen-nosodes': [],
} as const satisfies Record<BookId, ReadonlyArray<readonly [string, string, number, readonly string[]]>>;

const PREVIEW_CASES: Case[] = PREVIEW_CASE_DETAILS.map(
  ([id, name, bookId, timestamp]) => ({
    id,
    name,
    bookId,
    userId: 'preview',
    timestamp: new Date(timestamp),
    selectedSymptoms: PREVIEW_CASE_SYMPTOMS
      .filter(([caseId]) => caseId === id)
      .map(([, symptomId, symptomName]) => ({ id: symptomId, name: symptomName, books: [bookId] })),
  }),
);

const DRAFT_CASE = PREVIEW_CASES[0];
const INITIAL_SAVED_CASES = PREVIEW_CASES.slice(1);
const CREATED_CASE_ID = 'preview-created-case';

const DEMO_TIMING = {
  workspace: 1_400,
  character: 45,
  reducedMotionName: 500,
  namedHold: 1_000,
  saving: 600,
  savedHold: 1_800,
  clearedHold: 1_000,
  casesHold: 1_500,
  selectionHold: 700,
  restoredHold: 2_500,
} as const;

type DemoStage =
  | 'workspace'
  | 'naming'
  | 'saving'
  | 'saved'
  | 'cleared'
  | 'cases'
  | 'loading'
  | 'restored';

type PreviewIndication = FinderIndication & Case['selectedSymptoms'][number];

function resultsFor(bookId: BookId, selectedCount: number): FinderResult[] {
  return PREVIEW_RESULTS[bookId].map(([id, name, score, matchedSymptoms]) => ({
    remedy: { id, name, book: bookId },
    score: Math.min(score, selectedCount),
    matchedSymptoms: matchedSymptoms.slice(0, selectedCount),
  }));
}

function searchResultsFor(query: string, bookId: BookId): PreviewIndication[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  return PREVIEW_CASES
    .flatMap((caseItem) => caseItem.selectedSymptoms)
    .filter((symptom, index, symptoms) => (
      symptoms.findIndex((candidate) => candidate.name === symptom.name) === index
      && symptom.books?.includes(bookId)
      && words.every((word) => symptom.name.toLowerCase().includes(word))
    ))
    .map((symptom) => ({ ...symptom, books: symptom.books ?? [] }));
}

export function PreviewCasesScene() {
  const shouldReduceMotion = useReducedMotion();
  const [autoplay, setAutoplay] = useState(true);
  const [stage, setStage] = useState<DemoStage>('workspace');
  const [caseName, setCaseName] = useState('');
  const [cases, setCases] = useState<Case[]>(INITIAL_SAVED_CASES);
  const [currentCase, setCurrentCase] = useState<Case>(DRAFT_CASE);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);

  const activeBook = currentCase.bookId ?? 'boericke-MM';
  const results = useMemo(
    () => currentCase.selectedSymptoms.length > 0
      ? resultsFor(activeBook, currentCase.selectedSymptoms.length)
      : [],
    [activeBook, currentCase.selectedSymptoms.length],
  );
  const searchResults = useMemo(() => searchResultsFor(query, activeBook), [activeBook, query]);
  const currentSearchHasContent = query.trim().length > 0 || currentCase.selectedSymptoms.length > 0;

  const openSaveDialog = useCallback(() => {
    setAutoplay(false);
    setCaseName('');
    setStage('naming');
  }, []);

  const saveCurrentCase = useCallback((name: string) => {
    const createdCase = {
      ...currentCase,
      id: CREATED_CASE_ID,
      name: name.trim(),
      timestamp: new Date(),
    };

    setCases((savedCases) => [
      createdCase,
      ...savedCases.filter((caseItem) => caseItem.id !== CREATED_CASE_ID),
    ]);
    setSelectedCaseId(createdCase.id);
    setStage('saved');
  }, [currentCase]);

  const restoreCase = useCallback((caseItem: Case) => {
    setCurrentCase(caseItem);
    setSelectedCaseId(caseItem.id);
    setQuery('');
    setSearchOpen(false);
    setStage('restored');
  }, []);

  const clearCurrentSearch = useCallback(() => {
    setCurrentCase((caseItem) => ({ ...caseItem, selectedSymptoms: [] }));
    setSelectedCaseId(null);
    setQuery('');
    setSearchOpen(false);
  }, []);

  const resetDemo = useCallback(() => {
    setCurrentCase(DRAFT_CASE);
    setCases(INITIAL_SAVED_CASES);
    setSelectedCaseId(null);
    setCaseName('');
    setQuery('');
    setSearchOpen(false);
    setSourceOpen(false);
    setStage('workspace');
  }, []);

  useEffect(() => {
    if (stage === 'saving') {
      const timer = window.setTimeout(() => saveCurrentCase(caseName), DEMO_TIMING.saving);
      return () => window.clearTimeout(timer);
    }

    if (!autoplay) return undefined;

    let callback: () => void;
    let delay: number;

    if (stage === 'workspace') {
      callback = () => {
        setCaseName('');
        setStage('naming');
      };
      delay = DEMO_TIMING.workspace;
    } else if (stage === 'naming' && caseName !== DRAFT_CASE.name) {
      callback = () => setCaseName((name) => shouldReduceMotion
        ? DRAFT_CASE.name
        : DRAFT_CASE.name.slice(0, name.length + 1));
      delay = shouldReduceMotion ? DEMO_TIMING.reducedMotionName : DEMO_TIMING.character;
    } else if (stage === 'naming') {
      callback = () => setStage('saving');
      delay = DEMO_TIMING.namedHold;
    } else if (stage === 'saved') {
      callback = () => {
        clearCurrentSearch();
        setStage('cleared');
      };
      delay = DEMO_TIMING.savedHold;
    } else if (stage === 'cleared') {
      callback = () => setStage('cases');
      delay = DEMO_TIMING.clearedHold;
    } else if (stage === 'cases') {
      callback = () => {
        setSelectedCaseId(CREATED_CASE_ID);
        setStage('loading');
      };
      delay = DEMO_TIMING.casesHold;
    } else if (stage === 'loading') {
      callback = () => {
        const createdCase = cases.find((caseItem) => caseItem.id === CREATED_CASE_ID);
        if (createdCase) restoreCase(createdCase);
      };
      delay = DEMO_TIMING.selectionHold;
    } else {
      callback = resetDemo;
      delay = DEMO_TIMING.restoredHold;
    }

    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  }, [
    autoplay,
    caseName,
    cases,
    clearCurrentSearch,
    resetDemo,
    restoreCase,
    saveCurrentCase,
    shouldReduceMotion,
    stage,
  ]);

  const submitCase = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (caseName.trim()) {
      setAutoplay(false);
      setStage('saving');
    }
  };

  const loadCase = (caseItem: Case) => {
    if (
      currentSearchHasContent
      && !globalThis.confirm('Load this saved case and replace the current search?')
    ) {
      return;
    }

    restoreCase(caseItem);
  };

  const selectSymptom = (name: string) => {
    const symptom = searchResults.find((result) => result.name === name);
    if (!symptom) return;

    setCurrentCase((caseItem) => ({
      ...caseItem,
      selectedSymptoms: caseItem.selectedSymptoms.some((item) => item.name === name)
        ? caseItem.selectedSymptoms.filter((item) => item.name !== name)
        : [...caseItem.selectedSymptoms, symptom],
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <FinderWorkspace
        search={(
          <SymptomSearchView
            activeBook={activeBook}
            query={query}
            selectedSymptoms={currentCase.selectedSymptoms}
            results={searchResults}
            totalResults={searchResults.length}
            isSearching={false}
            isLoadingMore={false}
            showResults={searchOpen && searchResults.length > 0}
            showEmptyState={searchOpen && query.trim().length >= 2 && searchResults.length === 0}
            isOverlayOpen={searchOpen}
            onOpenBooks={() => {
              setAutoplay(false);
              setSearchOpen(false);
              setSourceOpen(true);
            }}
            onOpenCases={() => {
              setAutoplay(false);
              setSearchOpen(false);
              setStage('cases');
            }}
            onQueryChange={(value) => {
              setAutoplay(false);
              setQuery(value);
              setSearchOpen(true);
            }}
            onOpenSearch={() => {
              setAutoplay(false);
              setSearchOpen(true);
            }}
            onDismissSearch={() => setSearchOpen(false)}
            onClearQuery={() => setQuery('')}
            onSymptomSelect={selectSymptom}
            onResultsScroll={() => undefined}
          />
        )}
        symptoms={currentCase.selectedSymptoms}
        results={results}
        activeBookName={getBookName(activeBook)}
        onSaveCase={openSaveDialog}
        onClear={() => {
          setAutoplay(false);
          clearCurrentSearch();
        }}
        onRemove={(id) => {
          setAutoplay(false);
          setSelectedCaseId(null);
          setCurrentCase((caseItem) => ({
            ...caseItem,
            selectedSymptoms: caseItem.selectedSymptoms.filter((symptom) => symptom.id !== id),
          }));
        }}
      />

      <CasesDialog
        open={stage === 'saved' || stage === 'cases' || stage === 'loading'}
        onOpenChange={(open) => {
          setAutoplay(false);
          setStage(open ? 'cases' : 'restored');
        }}
        cases={cases}
        selectedCaseId={selectedCaseId}
        canManageCases
        onLoadCase={(caseItem) => {
          setAutoplay(false);
          loadCase(caseItem);
        }}
        onDeleteCase={(caseId) => {
          setAutoplay(false);
          if (!globalThis.confirm('Delete this case?')) return;
          setCases((savedCases) => savedCases.filter((caseItem) => caseItem.id !== caseId));
          if (selectedCaseId === caseId) setSelectedCaseId(null);
        }}
        onLogin={() => undefined}
        manageFocus={!autoplay}
      />

      <SaveCaseDialog
        open={stage === 'naming' || stage === 'saving'}
        onOpenChange={(open) => {
          setAutoplay(false);
          setStage(open ? 'naming' : 'workspace');
        }}
        caseName={caseName}
        onCaseNameChange={(name) => {
          setAutoplay(false);
          setCaseName(name);
        }}
        isSaving={stage === 'saving'}
        error=""
        onSubmit={submitCase}
        onCancel={() => {
          setAutoplay(false);
          setStage('workspace');
        }}
        manageFocus={!autoplay}
      />

      <SourceDialog
        open={sourceOpen}
        onOpenChange={setSourceOpen}
        activeBookId={activeBook}
        books={SEARCH_BOOKS}
        onSelectBook={(bookId) => {
          if (bookId === activeBook) {
            setSourceOpen(false);
            return;
          }

          if (
            currentSearchHasContent
            && !globalThis.confirm('Change source and clear the current search?')
          ) {
            return;
          }

          clearCurrentSearch();
          setCurrentCase((caseItem) => ({ ...caseItem, bookId }));
          setSourceOpen(false);
        }}
      />
    </div>
  );
}
