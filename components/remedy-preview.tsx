'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { BrandLockup } from '@/components/brand-lockup';
import {
  ResultsPanel,
  SelectedSymptomsPanel,
  SymptomSearchView,
  type FinderIndication,
  type FinderResult,
  type FinderSymptom,
} from '@/components/remedy-finder-view';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEMOS = [
  {
    query: 'burning pain at night',
    symptoms: [
      'Burning pains, worse at night',
      'Restlessness after midnight',
      'Thirst for small quantities',
    ],
    remedies: [
      ['Arsenicum album', '3', 'Burning pains · Restlessness · Thirst'],
      ['Phosphorus', '2', 'Burning pains · Thirst'],
      ['Sulphur', '2', 'Burning pains · Worse at night'],
    ],
  },
  {
    query: 'dry cough worse at night',
    symptoms: [
      'Dry cough, worse after midnight',
      'Tickling in the larynx',
      'Cough aggravated by cold air',
    ],
    remedies: [
      ['Drosera rotundifolia', '3', 'Dry cough · After midnight · Laryngeal tickling'],
      ['Bryonia alba', '2', 'Dry cough · Cold air'],
      ['Phosphorus', '2', 'Dry cough · Laryngeal tickling'],
    ],
  },
  {
    query: 'throbbing headache from sunlight',
    symptoms: [
      'Throbbing pain in the temples',
      'Headache aggravated by bright light',
      'Heat of the head with cold extremities',
    ],
    remedies: [
      ['Belladonna', '3', 'Throbbing pain · Bright light · Heat of head'],
      ['Glonoinum', '2', 'Throbbing pain · Sun exposure'],
      ['Natrum muriaticum', '2', 'Headache · Bright light'],
    ],
  },
] as const;

const DEMO_TIMING = {
  character: 42,
  firstMatch: 180,
  match: 100,
  firstSelection: 420,
  selection: 260,
  firstRemedy: 520,
  remedy: 360,
  hold: 3_600,
} as const;

function nextDelay(visible: number, first: number, following: number) {
  return visible === 0 ? first : following;
}

function symptomId(symptom: string) {
  return `preview-${symptom.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function RemedyPreview() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [queryLength, setQueryLength] = useState(0);
  const [visibleMatches, setVisibleMatches] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [visibleRemedies, setVisibleRemedies] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false);
  const demo = DEMOS[demoIndex];

  const resetStage = () => {
    setQueryLength(0);
    setVisibleMatches(0);
    setSelectedCount(0);
    setVisibleRemedies(0);
    setIsDropdownDismissed(false);
  };

  const replay = () => {
    setDemoIndex(0);
    resetStage();
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let callback: () => void;
    let delay: number;

    if (queryLength < demo.query.length) {
      callback = () => setQueryLength((length) => length + 1);
      delay = DEMO_TIMING.character;
    } else if (visibleMatches < demo.symptoms.length) {
      callback = () => setVisibleMatches((count) => count + 1);
      delay = nextDelay(visibleMatches, DEMO_TIMING.firstMatch, DEMO_TIMING.match);
    } else if (selectedCount < demo.symptoms.length) {
      callback = () => setSelectedCount((count) => count + 1);
      delay = nextDelay(selectedCount, DEMO_TIMING.firstSelection, DEMO_TIMING.selection);
    } else if (visibleRemedies < demo.remedies.length) {
      callback = () => setVisibleRemedies((count) => count + 1);
      delay = nextDelay(visibleRemedies, DEMO_TIMING.firstRemedy, DEMO_TIMING.remedy);
    } else {
      callback = () => {
        setDemoIndex((index) => (index + 1) % DEMOS.length);
        resetStage();
      };
      delay = DEMO_TIMING.hold;
    }

    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  }, [demo, isPlaying, queryLength, selectedCount, visibleMatches, visibleRemedies]);

  const query = demo.query.slice(0, queryLength);
  const dropdownOpen = queryLength === demo.query.length && selectedCount < demo.symptoms.length && !isDropdownDismissed;

  const indications = useMemo<FinderIndication[]>(
    () => demo.symptoms.slice(0, visibleMatches).map((name) => ({ name, books: ['boericke'] })),
    [demo.symptoms, visibleMatches],
  );
  const selectedSymptoms = useMemo<FinderSymptom[]>(
    () => demo.symptoms.slice(0, selectedCount).map((name) => ({ id: symptomId(name), name, books: ['boericke'] })),
    [demo.symptoms, selectedCount],
  );
  const results = useMemo<FinderResult[]>(
    () => demo.remedies.slice(0, visibleRemedies).map(([name, score, summary]) => ({
      remedy: { id: symptomId(name), name, book: 'boericke' },
      score: Number(score),
      matchedSymptoms: summary.split(' · '),
    })),
    [demo.remedies, visibleRemedies],
  );

  return (
    <section
      aria-label="Remedy finder demonstration"
      className="preview-device aspect-preview-mobile max-w-preview-mobile md:aspect-preview-desktop md:max-w-preview-desktop"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-3 py-2 md:px-5">
        <span className="sm:hidden"><BrandLockup compact /></span>
        <span className="hidden sm:inline-flex"><BrandLockup /></span>
        <div className="flex items-center gap-3">
          <span className="index-label hidden sm:inline">Live finder preview</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={isPlaying ? 'Pause demonstration' : 'Play demonstration'}
              onClick={() => setIsPlaying((playing) => !playing)}
            >
              {isPlaying ? <Pause aria-hidden="true" className="h-4 w-4" /> : <Play aria-hidden="true" className="h-4 w-4" />}
            </Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Replay demonstration" onClick={replay}>
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="preview-workspace flex min-h-0 flex-1 flex-col gap-5 overflow-hidden py-5">
        <section aria-label="Symptom search" className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <SymptomSearchView
            activeBook="boericke"
            query={query}
            selectedSymptoms={selectedSymptoms}
            results={indications}
            totalResults={demo.symptoms.length}
            isSearching={queryLength === demo.query.length && visibleMatches === 0}
            isLoadingMore={false}
            showResults={dropdownOpen}
            showEmptyState={false}
            isOverlayOpen={dropdownOpen}
            containedOverlay
            readOnly
            onOpenBooks={() => undefined}
            onOpenCases={() => undefined}
            onQueryChange={() => undefined}
            onOpenSearch={() => setIsDropdownDismissed(false)}
            onDismissSearch={() => setIsDropdownDismissed(true)}
            onClearQuery={replay}
            onSymptomSelect={(name) => {
              const index = demo.symptoms.map(String).indexOf(name);
              if (index >= 0) setSelectedCount((count) => Math.max(count, index + 1));
            }}
            onResultsScroll={() => undefined}
          />
        </section>

        <section
          aria-label="Selected symptoms and matching remedies"
          className={cn('page-shell grid items-start gap-5', results.length > 0 && 'lg:grid-cols-12')}
        >
          <SelectedSymptomsPanel
            symptoms={selectedSymptoms}
            activeBookName="Boericke"
            className={results.length > 0 ? 'lg:col-span-5' : undefined}
            onSaveCase={() => undefined}
            onClear={replay}
            onRemove={() => undefined}
          />
          <ResultsPanel
            results={results}
            activeBookName="Boericke"
            selectedCount={selectedSymptoms.length}
            className="lg:col-span-7"
          />
        </section>
      </div>
    </section>
  );
}
