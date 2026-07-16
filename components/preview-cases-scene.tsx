'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

import { CasesDialog } from '@/components/cases-dialog';
import { FinderWorkspace } from '@/components/finder-workspace';
import { Header } from '@/components/header';
import {
  SymptomSearchView,
  type FinderResult,
} from '@/components/remedy-finder-view';
import { SaveCaseDialog } from '@/components/save-case-dialog';
import type { BookId, Case } from '@/types';

const PREVIEW_CASE_DETAILS = [
  ['night-time-burning-pain', 'Night-time burning pain', 'boericke', '2026-07-12T00:00:00.000Z'],
  ['dry-cough-follow-up', 'Dry cough follow-up', 'clarke', '2026-07-08T00:00:00.000Z'],
  ['sunlight-headache', 'Sunlight headache', 'kent', '2026-06-29T00:00:00.000Z'],
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
  boericke: [
    ['arsenicum-album', 'Arsenicum album', 3, ['Burning pains', 'Restlessness', 'Thirst']],
    ['phosphorus', 'Phosphorus', 2, ['Burning pains', 'Thirst']],
    ['sulphur', 'Sulphur', 2, ['Burning pains', 'Worse at night']],
  ],
  clarke: [
    ['drosera-rotundifolia', 'Drosera rotundifolia', 3, ['Dry cough', 'After midnight', 'Laryngeal tickling']],
    ['bryonia-alba', 'Bryonia alba', 2, ['Dry cough', 'Cold air']],
    ['phosphorus', 'Phosphorus', 2, ['Dry cough', 'Laryngeal tickling']],
  ],
  kent: [
    ['belladonna', 'Belladonna', 3, ['Throbbing pain', 'Bright light', 'Heat of head']],
    ['glonoinum', 'Glonoinum', 2, ['Throbbing pain', 'Sun exposure']],
    ['natrum-muriaticum', 'Natrum muriaticum', 2, ['Headache', 'Bright light']],
  ],
  allen: [],
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
  savedHold: 2_000,
  restoredHold: 3_000,
  casesHold: 1_800,
} as const;

type DemoStage = 'workspace' | 'naming' | 'saved' | 'restored' | 'cases';

function prettyBook(bookId: BookId) {
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
}

function resultsFor(bookId: BookId): FinderResult[] {
  return PREVIEW_RESULTS[bookId].map(([id, name, score, matchedSymptoms]) => ({
    remedy: { id, name, book: bookId },
    score,
    matchedSymptoms: [...matchedSymptoms],
  }));
}

export function PreviewCasesScene() {
  const shouldReduceMotion = useReducedMotion();
  const [autoplay, setAutoplay] = useState(true);
  const [stage, setStage] = useState<DemoStage>('workspace');
  const [caseName, setCaseName] = useState('');
  const [cases, setCases] = useState<Case[]>(INITIAL_SAVED_CASES);
  const [currentCase, setCurrentCase] = useState<Case>(DRAFT_CASE);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const activeBook = currentCase.bookId ?? 'boericke';
  const results = useMemo(() => resultsFor(activeBook), [activeBook]);

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
      timestamp: new Date('2026-07-16T00:00:00.000Z'),
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
    setStage('restored');
  }, []);

  const resetDemo = useCallback(() => {
    setCurrentCase(DRAFT_CASE);
    setCases(INITIAL_SAVED_CASES);
    setSelectedCaseId(null);
    setCaseName('');
    setStage('workspace');
  }, []);

  useEffect(() => {
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
      callback = () => saveCurrentCase(caseName);
      delay = DEMO_TIMING.namedHold;
    } else if (stage === 'saved') {
      callback = () => restoreCase(INITIAL_SAVED_CASES[0]);
      delay = DEMO_TIMING.savedHold;
    } else if (stage === 'restored') {
      callback = () => setStage('cases');
      delay = DEMO_TIMING.restoredHold;
    } else {
      callback = resetDemo;
      delay = DEMO_TIMING.casesHold;
    }

    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  }, [autoplay, caseName, resetDemo, restoreCase, saveCurrentCase, shouldReduceMotion, stage]);

  const submitCase = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (caseName.trim()) {
      setAutoplay(false);
      saveCurrentCase(caseName);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <FinderWorkspace
        search={(
          <SymptomSearchView
            activeBook={activeBook}
            query=""
            selectedSymptoms={currentCase.selectedSymptoms}
            results={[]}
            totalResults={0}
            isSearching={false}
            isLoadingMore={false}
            showResults={false}
            showEmptyState={false}
            isOverlayOpen={false}
            readOnly
            onOpenBooks={() => undefined}
            onOpenCases={() => {
              setAutoplay(false);
              setStage('cases');
            }}
            onQueryChange={() => undefined}
            onOpenSearch={() => undefined}
            onDismissSearch={() => undefined}
            onClearQuery={() => undefined}
            onSymptomSelect={() => undefined}
            onResultsScroll={() => undefined}
          />
        )}
        symptoms={currentCase.selectedSymptoms}
        results={results}
        activeBookName={prettyBook(activeBook)}
        onSaveCase={openSaveDialog}
        onClear={() => undefined}
        onRemove={() => undefined}
      />

      <CasesDialog
        open={stage === 'saved' || stage === 'cases'}
        onOpenChange={(open) => {
          setAutoplay(false);
          setStage(open ? 'cases' : 'restored');
        }}
        cases={cases}
        selectedCaseId={selectedCaseId}
        canManageCases
        onLoadCase={(caseItem) => {
          setAutoplay(false);
          restoreCase(caseItem);
        }}
        onDeleteCase={(caseId) => {
          setAutoplay(false);
          setCases((savedCases) => savedCases.filter((caseItem) => caseItem.id !== caseId));
          if (selectedCaseId === caseId) setSelectedCaseId(null);
        }}
        onLogin={() => undefined}
        manageFocus={!autoplay}
      />

      <SaveCaseDialog
        open={stage === 'naming'}
        onOpenChange={(open) => {
          setAutoplay(false);
          setStage(open ? 'naming' : 'workspace');
        }}
        caseName={caseName}
        onCaseNameChange={(name) => {
          setAutoplay(false);
          setCaseName(name);
        }}
        isSaving={false}
        error=""
        onSubmit={submitCase}
        onCancel={() => {
          setAutoplay(false);
          setStage('workspace');
        }}
        manageFocus={!autoplay}
      />
    </div>
  );
}
