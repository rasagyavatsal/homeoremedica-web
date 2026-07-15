'use client';

import { Check, FileText } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PREVIEW_CASES = [
  {
    name: 'Night-time burning pain',
    date: '12 Jul 2026',
    source: 'Boericke',
    symptoms: [
      'Burning pains, worse at night',
      'Restlessness after midnight',
      'Thirst for small quantities',
    ],
    remedies: ['Arsenicum album', 'Phosphorus', 'Sulphur'],
  },
  {
    name: 'Dry cough follow-up',
    date: '08 Jul 2026',
    source: 'Clarke',
    symptoms: [
      'Dry cough, worse after midnight',
      'Tickling in the larynx',
      'Cough aggravated by cold air',
    ],
    remedies: ['Drosera rotundifolia', 'Bryonia alba', 'Phosphorus'],
  },
  {
    name: 'Sunlight headache',
    date: '29 Jun 2026',
    source: 'Kent',
    symptoms: [
      'Throbbing pain in the temples',
      'Headache aggravated by bright light',
      'Heat of the head with cold extremities',
    ],
    remedies: ['Belladonna', 'Glonoinum', 'Natrum muriaticum'],
  },
] as const;

export function CasesPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCase = PREVIEW_CASES[activeIndex];

  return (
    <section
      aria-label="Saved cases preview"
      className="preview-device aspect-preview-mobile max-w-preview-mobile md:aspect-preview-desktop md:max-w-preview-desktop"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <FileText aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-medium tracking-display">Saved cases</span>
        </div>
        <span className="index-label">Showing {PREVIEW_CASES.length} cases</span>
      </div>

      <div className="cases-preview-grid grid min-h-0 flex-1">
        <div className="border-b border-border bg-surface-container-low p-3 md:border-b-0 md:border-r">
          {PREVIEW_CASES.map((caseItem, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={caseItem.name}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'flex w-full items-start justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-surface-bright',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{caseItem.name}</span>
                  <span className="index-label mt-1 block">{caseItem.date} · {caseItem.source}</span>
                </span>
                {isActive ? <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : null}
              </button>
            );
          })}
        </div>

        <article className="min-w-0 p-5 md:p-7" aria-live="polite">
          <div className="border-b border-border pb-5">
            <p className="index-label mb-2">{activeCase.source} · {activeCase.date}</p>
            <h3 className="font-display text-2xl font-medium tracking-display text-foreground">
              {activeCase.name}
            </h3>
          </div>

          <div className="grid gap-6 pt-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Selected symptoms</p>
              <ul className="space-y-2">
                {activeCase.symptoms.map((symptom) => (
                  <li key={symptom} className="rounded-md border border-border bg-surface-bright px-3 py-2 text-sm text-on-surface-variant">
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Matching remedies</p>
              <ol className="space-y-2">
                {activeCase.remedies.map((remedy, index) => (
                  <li key={remedy} className="flex items-center gap-3 rounded-md px-1 py-2 text-sm">
                    <Badge variant={index === 0 ? 'default' : 'outline'}>{index + 1}</Badge>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
