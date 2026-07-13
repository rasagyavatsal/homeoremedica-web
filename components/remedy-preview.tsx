'use client';

import { BookOpen, FileText, Pause, Play, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
  firstSymptom: 360,
  symptom: 260,
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
  const [visibleSymptoms, setVisibleSymptoms] = useState(0);
  const [visibleRemedies, setVisibleRemedies] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const demo = DEMOS[demoIndex];

  const replay = () => {
    setDemoIndex(0);
    setQueryLength(0);
    setVisibleSymptoms(0);
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
    } else if (visibleSymptoms < demo.symptoms.length) {
      callback = () => setVisibleSymptoms((count) => count + 1);
      delay = nextDelay(visibleSymptoms, DEMO_TIMING.firstSymptom, DEMO_TIMING.symptom);
    } else if (visibleRemedies < demo.remedies.length) {
      callback = () => setVisibleRemedies((count) => count + 1);
      delay = nextDelay(visibleRemedies, DEMO_TIMING.firstRemedy, DEMO_TIMING.remedy);
    } else {
      callback = () => {
        setDemoIndex((index) => (index + 1) % DEMOS.length);
        setQueryLength(0);
        setVisibleSymptoms(0);
        setVisibleRemedies(0);
      };
      delay = DEMO_TIMING.hold;
    }

    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  }, [demo, isPlaying, queryLength, visibleRemedies, visibleSymptoms]);

  return (
    <section aria-label="Remedy finder demonstration" className="quiet-panel overflow-hidden p-3 md:p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 px-1">
          <span className="index-label">Live finder preview</span>
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

        <Card>
          <CardHeader className="flex-row items-end justify-between border-b border-border p-4 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base">Selected symptoms</CardTitle>
              <p className="index-label">{visibleSymptoms} entries · Boericke</p>
            </div>
            <span className="index-label text-primary">{String(visibleSymptoms).padStart(2, '0')}</span>
          </CardHeader>
          <CardContent className="min-h-preview-symptoms px-4 pb-2 pt-1">
            {demo.symptoms.slice(0, visibleSymptoms).map((symptom, index) => (
              <div key={symptom} className="preview-row flex gap-3 border-b border-border py-2.5 last:border-b-0">
                <span aria-hidden="true" className="index-label pt-0.5 text-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-relaxed text-foreground">{symptom}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="button" size="sm" className="pointer-events-none gap-2" tabIndex={-1}>
          <Search aria-hidden="true" className="h-4 w-4" />
          Find remedies
          <span className="rounded-full bg-primary-foreground/20 px-2 py-1 font-code text-micro leading-none tracking-label">
            {String(visibleSymptoms).padStart(2, '0')}
          </span>
        </Button>

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
    </section>
  );
}
