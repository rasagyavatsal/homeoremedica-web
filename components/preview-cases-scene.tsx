'use client';

import { useState } from 'react';

import { CasesDialog } from '@/components/cases-dialog';
import { FinderWorkspace } from '@/components/finder-workspace';
import { Header } from '@/components/header';
import { SymptomSearchView } from '@/components/remedy-finder-view';
import type { Case } from '@/types';

const PREVIEW_CASES: Case[] = [
  {
    id: 'night-time-burning-pain',
    name: 'Night-time burning pain',
    bookId: 'boericke',
    userId: 'preview',
    timestamp: new Date('2026-07-12T00:00:00.000Z'),
    selectedSymptoms: [
      { id: 'burning-pain', name: 'Burning pains, worse at night', books: ['boericke'] },
      { id: 'restlessness', name: 'Restlessness after midnight', books: ['boericke'] },
      { id: 'thirst', name: 'Thirst for small quantities', books: ['boericke'] },
    ],
  },
  {
    id: 'dry-cough-follow-up',
    name: 'Dry cough follow-up',
    bookId: 'clarke',
    userId: 'preview',
    timestamp: new Date('2026-07-08T00:00:00.000Z'),
    selectedSymptoms: [
      { id: 'dry-cough', name: 'Dry cough, worse after midnight', books: ['clarke'] },
      { id: 'larynx', name: 'Tickling in the larynx', books: ['clarke'] },
      { id: 'cold-air', name: 'Cough aggravated by cold air', books: ['clarke'] },
    ],
  },
  {
    id: 'sunlight-headache',
    name: 'Sunlight headache',
    bookId: 'kent',
    userId: 'preview',
    timestamp: new Date('2026-06-29T00:00:00.000Z'),
    selectedSymptoms: [
      { id: 'throbbing', name: 'Throbbing pain in the temples', books: ['kent'] },
      { id: 'bright-light', name: 'Headache aggravated by bright light', books: ['kent'] },
      { id: 'heat-head', name: 'Heat of the head with cold extremities', books: ['kent'] },
    ],
  },
];

export function PreviewCasesScene() {
  const [open, setOpen] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(PREVIEW_CASES[0].id);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <FinderWorkspace
        search={(
          <SymptomSearchView
            activeBook="boericke"
            query=""
            selectedSymptoms={[]}
            results={[]}
            totalResults={0}
            isSearching={false}
            isLoadingMore={false}
            showResults={false}
            showEmptyState={false}
            isOverlayOpen={false}
            readOnly
            onOpenBooks={() => undefined}
            onOpenCases={() => setOpen(true)}
            onQueryChange={() => undefined}
            onOpenSearch={() => undefined}
            onDismissSearch={() => undefined}
            onClearQuery={() => undefined}
            onSymptomSelect={() => undefined}
            onResultsScroll={() => undefined}
          />
        )}
        symptoms={[]}
        results={[]}
        activeBookName="Boericke"
        onSaveCase={() => undefined}
        onClear={() => undefined}
        onRemove={() => undefined}
      />
      <CasesDialog
        open={open}
        onOpenChange={setOpen}
        cases={PREVIEW_CASES}
        selectedCaseId={selectedCaseId}
        canManageCases
        onLoadCase={(caseItem) => {
          setSelectedCaseId(caseItem.id);
          setOpen(false);
        }}
        onDeleteCase={() => undefined}
        onLogin={() => undefined}
      />
    </div>
  );
}
