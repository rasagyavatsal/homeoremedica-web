'use client';

import { BookOpen, Check, FileText, Pause, Play, Plus, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { BrandLockup } from '@/components/brand-lockup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motionClassNames } from '@/lib/motion/system';

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

export function RemedyPreview() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [queryLength, setQueryLength] = useState(0);
  const [visibleMatches, setVisibleMatches] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState(0);
  const [visibleRemedies, setVisibleRemedies] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const demo = DEMOS[demoIndex];

  const replay = () => {
    setDemoIndex(0);
    setQueryLength(0);
    setVisibleMatches(0);
    setSelectedSymptoms(0);
    setVisibleRemedies(0);
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
    } else if (selectedSymptoms < demo.symptoms.length) {
      callback = () => setSelectedSymptoms((count) => count + 1);
      delay = nextDelay(selectedSymptoms, DEMO_TIMING.firstSelection, DEMO_TIMING.selection);
    } else if (visibleRemedies < demo.remedies.length) {
      callback = () => setVisibleRemedies((count) => count + 1);
      delay = nextDelay(visibleRemedies, DEMO_TIMING.firstRemedy, DEMO_TIMING.remedy);
    } else {
      callback = () => {
        setDemoIndex((index) => (index + 1) % DEMOS.length);
        setQueryLength(0);
        setVisibleMatches(0);
        setSelectedSymptoms(0);
        setVisibleRemedies(0);
      };
      delay = DEMO_TIMING.hold;
    }

    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  }, [demo, isPlaying, queryLength, selectedSymptoms, visibleMatches, visibleRemedies]);

  const dropdownOpen = queryLength === demo.query.length && visibleRemedies === 0;

  return (
    <section
      aria-label="Remedy finder demonstration"
      className="preview-device aspect-preview-mobile max-w-preview-mobile md:aspect-preview-desktop md:max-w-preview-desktop"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-3 py-2 md:px-5">
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
              {isPlaying
                ? <Pause aria-hidden="true" className="h-4 w-4" />
                : <Play aria-hidden="true" className="h-4 w-4" />}
            </Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Replay demonstration" onClick={replay}>
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="preview-workspace space-y-3 p-3 md:p-5">

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="outline" className="gap-2 py-2">
            <BookOpen aria-hidden="true" className="h-4 w-4 text-primary" />
            <span className="text-on-surface-variant">Source</span>
            <span className="font-semibold text-foreground">Boericke</span>
          </Badge>
          <Badge variant="outline" className="gap-2 py-2">
            <FileText aria-hidden="true" className="h-4 w-4" />
            Saved cases
          </Badge>
        </div>

        <div className="relative">
          <div className={`rounded-xl border border-border bg-card shadow-soft ${motionClassNames.surface}`}>
            <div className="flex min-h-control-lg items-center gap-3 px-4 md:px-6">
              <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
              <output
                aria-label="Case being searched"
                className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-base text-foreground md:text-lg"
              >
                {demo.query.slice(0, queryLength)}
                <span aria-hidden="true" className="preview-cursor" />
              </output>
            </div>
          </div>

          {dropdownOpen ? (
            <div className="preview-dropdown absolute left-0 right-0 top-full z-20 mt-3 overflow-hidden rounded-xl border border-border bg-popover shadow-overlay">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
                <p className="text-sm font-medium text-foreground">Matching indications</p>
                <span className="index-label">{demo.symptoms.length} indications</span>
              </div>
              <div role="listbox" aria-label="Matching indications">
                {demo.symptoms.slice(0, visibleMatches).map((symptom, index) => {
                  const isSelected = index < selectedSymptoms;
                  return (
                    <div
                      key={symptom}
                      role="option"
                      aria-selected={isSelected}
                      className="preview-row flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0 md:px-6"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-relaxed text-foreground">{symptom}</p>
                        <p className="index-label mt-1">Boericke</p>
                      </div>
                      {isSelected ? (
                        <span className="flex shrink-0 items-center gap-2 text-primary">
                          <Badge>Selected</Badge>
                          <Check aria-hidden="true" className="h-4 w-4" />
                        </span>
                      ) : (
                        <Plus aria-hidden="true" className="h-4 w-4 shrink-0 text-on-surface-variant" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="preview-workspace-grid grid gap-3 md:grid-cols-2">
        <Card className={visibleRemedies > 0 ? 'hidden md:block' : undefined}>
          <CardHeader className="flex-row items-end justify-between border-b border-border p-4 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base">Selected symptoms</CardTitle>
              <p className="index-label">{selectedSymptoms} entries · Boericke</p>
            </div>
            <span className="index-label text-primary">{String(selectedSymptoms).padStart(2, '0')}</span>
          </CardHeader>
          <CardContent className="min-h-preview-symptoms px-4 pb-2 pt-1">
            {demo.symptoms.slice(0, selectedSymptoms).map((symptom, index) => (
              <div key={symptom} className="preview-row flex gap-3 border-b border-border py-2.5 last:border-b-0">
                <span aria-hidden="true" className="index-label pt-0.5 text-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-relaxed text-foreground">{symptom}</span>
              </div>
            ))}
          </CardContent>
          <div className="border-t border-border px-4 py-3">
            <Button type="button" size="sm" className="pointer-events-none gap-2" tabIndex={-1}>
              <Search aria-hidden="true" className="h-4 w-4" />
              Find remedies
              <span className="rounded-full bg-primary-foreground/20 px-2 py-1 font-code text-micro leading-none tracking-label">
                {String(selectedSymptoms).padStart(2, '0')}
              </span>
            </Button>
          </div>
        </Card>

        <Card className="min-h-preview-remedies">
          <CardHeader className="border-b border-border p-4 pb-3">
            <CardTitle className="text-base">Matching remedies</CardTitle>
            <p className="index-label">{visibleRemedies} remedies · Boericke</p>
          </CardHeader>
          <CardContent className="px-4 pb-2 pt-1" aria-live="polite">
            {demo.remedies.slice(0, visibleRemedies).map(([remedy, score, summary]) => (
              <div key={remedy} className="preview-row border-b border-border py-3 last:border-b-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{remedy}</span>
                  <Badge>Matches {score} of {demo.symptoms.length}</Badge>
                  <Badge variant="outline">Boericke</Badge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">{summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        </div>
      </div>
    </section>
  );
}
