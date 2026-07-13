'use client';

import { Check, Pause, Play, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

const DEMO = {
  query: 'burning pain, restless after midnight',
  symptoms: [
    'Burning pains, worse at night',
    'Restlessness after midnight',
    'Thirst for small quantities',
  ],
  remedies: [
    ['Arsenicum album', '3 of 3'],
    ['Phosphorus', '2 of 3'],
    ['Sulphur', '2 of 3'],
  ],
} as const;

const DEMO_TIMING = {
  character: 42,
  firstMatch: 360,
  match: 260,
  firstRemedy: 520,
  remedy: 360,
  hold: 5_200,
} as const;

function nextDelay(visible: number, first: number, following: number) {
  return visible === 0 ? first : following;
}

export function RemedyPreview() {
  const [queryLength, setQueryLength] = useState(0);
  const [visibleSymptoms, setVisibleSymptoms] = useState(0);
  const [visibleRemedies, setVisibleRemedies] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const replay = () => {
    setQueryLength(0);
    setVisibleSymptoms(0);
    setVisibleRemedies(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let callback: () => void;
    let delay: number;

    if (queryLength < DEMO.query.length) {
      callback = () => setQueryLength((length) => length + 1);
      delay = DEMO_TIMING.character;
    } else if (visibleSymptoms < DEMO.symptoms.length) {
      callback = () => setVisibleSymptoms((count) => count + 1);
      delay = nextDelay(visibleSymptoms, DEMO_TIMING.firstMatch, DEMO_TIMING.match);
    } else if (visibleRemedies < DEMO.remedies.length) {
      callback = () => setVisibleRemedies((count) => count + 1);
      delay = nextDelay(visibleRemedies, DEMO_TIMING.firstRemedy, DEMO_TIMING.remedy);
    } else {
      callback = replay;
      delay = DEMO_TIMING.hold;
    }

    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  }, [isPlaying, queryLength, visibleRemedies, visibleSymptoms]);

  const status = queryLength < DEMO.query.length
    ? 'Reading the case'
    : visibleSymptoms < DEMO.symptoms.length
      ? 'Matching indications'
      : visibleRemedies < DEMO.remedies.length
        ? 'Comparing remedies'
        : '3 remedies found';

  return (
    <section aria-label="Remedy finder demonstration" className="quiet-panel overflow-hidden p-3 md:p-4">
      <div className="rounded-lg border border-border bg-surface-bright p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="index-label">Live preview</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={isPlaying ? 'Pause demonstration' : 'Play demonstration'}
              onClick={() => setIsPlaying((playing) => !playing)}
            >
              {isPlaying
                ? <Pause aria-hidden="true" className="h-4 w-4" />
                : <Play aria-hidden="true" className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Replay demonstration"
              onClick={replay}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
          <input
            aria-label="Case being searched"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none"
            readOnly
            tabIndex={-1}
            value={DEMO.query.slice(0, queryLength)}
          />
          <span aria-hidden="true" className="preview-cursor" />
        </div>

        <div className="min-h-preview-symptoms space-y-1 py-4">
          {DEMO.symptoms.slice(0, visibleSymptoms).map((symptom) => (
            <div key={symptom} className="preview-row flex items-start gap-3 rounded-md px-3 py-3 text-sm text-on-surface-variant">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{symptom}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="index-label" aria-live="polite">{status}</span>
            <span className="index-label">Match</span>
          </div>
          <div className="min-h-preview-remedies">
            {DEMO.remedies.slice(0, visibleRemedies).map(([remedy, match], index) => (
              <div key={remedy} className="preview-row flex items-center gap-4 border-t border-border py-3 first:border-t-0">
                <span className="index-label text-primary">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 text-sm font-medium">{remedy}</span>
                <span className="font-code text-xs text-on-surface-variant">{match}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
