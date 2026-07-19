'use client';

import { useEffect, useMemo, useState } from 'react';

import { FinderWorkspace } from '@/components/finder-workspace';
import {
  SymptomSearchView,
  type FinderIndication,
  type FinderResult,
  type FinderSymptom,
} from '@/components/remedy-finder-view';
import { getBookName } from '@/lib/seo/book-data';

const DEMOS = [
  {
    query: 'burning pain night',
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
    query: 'dry cough night',
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
    query: 'throbbing headache sunlight',
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
  hold: 3_600,
} as const;

function nextDelay(visible: number, first: number, following: number) {
  return visible === 0 ? first : following;
}

function symptomId(symptom: string) {
  return `preview-${symptom.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function PreviewRemedyScene() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [queryLength, setQueryLength] = useState(0);
  const [visibleMatches, setVisibleMatches] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [visibleRemedies, setVisibleRemedies] = useState(0);
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false);
  const demo = DEMOS[demoIndex];

  const resetStage = () => {
    setQueryLength(0);
    setVisibleMatches(0);
    setSelectedCount(0);
    setVisibleRemedies(0);
    setIsDropdownDismissed(false);
  };

  useEffect(() => {
    let callback: () => void;
    let delay: number;

    if (queryLength < demo.query.length) {
      callback = () => setQueryLength((length) => length + 1);
      delay = DEMO_TIMING.character;
    } else if (visibleMatches < demo.symptoms.length) {
      callback = () => setVisibleMatches((count) => count + 1);
      delay = nextDelay(visibleMatches, DEMO_TIMING.firstMatch, DEMO_TIMING.match);
    } else if (selectedCount < demo.symptoms.length) {
      callback = () => {
        const nextCount = selectedCount + 1;
        setSelectedCount(nextCount);

        if (nextCount === demo.symptoms.length) {
          setVisibleRemedies(demo.remedies.length);
        }
      };
      delay = nextDelay(selectedCount, DEMO_TIMING.firstSelection, DEMO_TIMING.selection);
    } else {
      callback = () => {
        setDemoIndex((index) => (index + 1) % DEMOS.length);
        resetStage();
      };
      delay = DEMO_TIMING.hold;
    }

    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  }, [demo, queryLength, selectedCount, visibleMatches, visibleRemedies]);

  const query = demo.query.slice(0, queryLength);
  const dropdownOpen = queryLength === demo.query.length && selectedCount < demo.symptoms.length && !isDropdownDismissed;

  const indications = useMemo<FinderIndication[]>(
    () => demo.symptoms.slice(0, visibleMatches).map((name) => ({ name, books: ['boericke-MM'] })),
    [demo.symptoms, visibleMatches],
  );
  const selectedSymptoms = useMemo<FinderSymptom[]>(
    () => demo.symptoms.slice(0, selectedCount).map((name) => ({ id: symptomId(name), name, books: ['boericke-MM'] })),
    [demo.symptoms, selectedCount],
  );
  const results = useMemo<FinderResult[]>(
    () => demo.remedies.slice(0, visibleRemedies).map(([name, score, summary]) => ({
      remedy: { id: symptomId(name), name, book: 'boericke-MM' },
      score: Number(score),
      matchedSymptoms: summary.split(' · '),
    })),
    [demo.remedies, visibleRemedies],
  );

  const replay = () => {
    setDemoIndex(0);
    resetStage();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <FinderWorkspace
        search={(
          <SymptomSearchView
            activeBook="boericke-MM"
            query={query}
            selectedSymptoms={selectedSymptoms}
            results={indications}
            totalResults={demo.symptoms.length}
            isSearching={queryLength === demo.query.length && visibleMatches === 0}
            isLoadingMore={false}
            showResults={dropdownOpen}
            showEmptyState={false}
            isOverlayOpen={dropdownOpen}
            readOnly
            onOpenBooks={() => undefined}
            onOpenCases={() => undefined}
            onQueryChange={() => undefined}
            onOpenSearch={() => setIsDropdownDismissed(false)}
            onDismissSearch={() => setIsDropdownDismissed(true)}
            onClearQuery={replay}
            onSymptomSelect={(name) => {
              const index = demo.symptoms.map(String).indexOf(name);
              if (index < 0) return;

              const nextCount = Math.max(selectedCount, index + 1);
              setSelectedCount(nextCount);

              if (nextCount === demo.symptoms.length) {
                setVisibleRemedies(demo.remedies.length);
              }
            }}
            onResultsScroll={() => undefined}
          />
        )}
        symptoms={selectedSymptoms}
        results={results}
        activeBookName={getBookName('boericke-MM')}
        onSaveCase={() => undefined}
        onClear={replay}
        onRemove={() => undefined}
      />
    </div>
  );
}
