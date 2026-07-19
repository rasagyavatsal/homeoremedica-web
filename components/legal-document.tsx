"use client"

import type { ReactNode } from 'react';
import { Calendar } from 'lucide-react';

import { PillLink } from '@/components/ui/interactive';
import { MotionReveal, MotionSafeShell, MotionSection } from '@/components/ui/motion';
import { motionClassNames } from '@/lib/motion/system';

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalDocument({ title, lastUpdated, sections }: Readonly<LegalDocumentProps>) {
  return (
    <main className="flex-1 min-h-screen">
      <div className="page-shell py-16 lg:py-24">
        <MotionSafeShell className="reading-shell space-y-10 md:space-y-14">
          <MotionSection className="space-y-4">
            <h1 className="display-md text-foreground">{title}</h1>
            <div className="index-label flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </MotionSection>

          <nav className="flex flex-wrap gap-2" aria-label={`${title} sections`}>
            {sections.map((section) => (
              <PillLink
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {section.title}
              </PillLink>
            ))}
          </nav>

          <div className="space-y-8 md:space-y-10">
            {sections.map((section) => (
              <MotionReveal
                key={section.id}
                id={section.id}
                className={`scroll-mt-28 space-y-4 ${motionClassNames.surface}`}
              >
                <h2 className="border-t border-border pt-5 font-display text-xl font-medium tracking-display text-foreground md:text-2xl">
                  {section.title}
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
                  {section.content}
                </div>
              </MotionReveal>
            ))}
          </div>
        </MotionSafeShell>
      </div>
    </main>
  );
}
