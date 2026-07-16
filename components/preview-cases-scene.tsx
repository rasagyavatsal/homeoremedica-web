'use client';

import { useState } from 'react';

import { CasesDialog } from '@/components/cases-dialog';
import { FinderWorkspace } from '@/components/finder-workspace';
import { Header } from '@/components/header';
import { SymptomSearchView } from '@/components/remedy-finder-view';
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
