'use client';

import {
  ResultsPanel,
  SelectedSymptomsPanel,
  type FinderResult,
  type FinderSymptom,
} from '@/components/remedy-finder-view';
import { MotionSafeShell, MotionSection } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

export function FinderWorkspace({
  search,
  notice,
  symptoms,
  results,
  activeBookName,
  onSaveCase,
  onClear,
  onRemove,
}: Readonly<{
  search: React.ReactNode;
  notice?: React.ReactNode;
  symptoms: FinderSymptom[];
  results: FinderResult[];
  activeBookName: string;
  onSaveCase: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}>) {
  return (
    <main className="flex-1">
      <h1 className="sr-only">Find a homoeopathic remedy</h1>
      <MotionSafeShell className="min-h-viewport-below-header flex flex-col gap-5 py-5 lg:py-8">
        <section aria-label="Symptom search" className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <MotionSection className="space-y-4">
            {notice}
            {search}
          </MotionSection>
        </section>

        <section
          aria-label="Selected symptoms and matching remedies"
          className={cn('page-shell grid items-start gap-5', results.length > 0 && 'lg:grid-cols-12')}
        >
          <SelectedSymptomsPanel
            symptoms={symptoms}
            activeBookName={activeBookName}
            className={results.length > 0 ? 'lg:col-span-5' : undefined}
            onSaveCase={onSaveCase}
            onClear={onClear}
            onRemove={onRemove}
          />

          <ResultsPanel
            results={results}
            activeBookName={activeBookName}
            selectedCount={symptoms.length}
            className="lg:col-span-7"
          />
        </section>
      </MotionSafeShell>
    </main>
  );
}
