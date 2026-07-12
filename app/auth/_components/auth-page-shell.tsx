"use client";

import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { MotionRouteShell, MotionSection } from '@/components/ui/motion';
import { motionClassNames } from '@/lib/motion/system';

interface AuthPageShellProps {
  readonly children: React.ReactNode;
  readonly showBrand?: boolean;
}

export function AuthPageShell({ children, showBrand = true }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center">
        <MotionRouteShell className="w-full max-w-md space-y-6">
          {showBrand && (
            <MotionSection className="space-y-3 text-center">
              <Link href="/" className="inline-flex items-center justify-center">
                <span className="font-display text-3xl font-medium tracking-display text-foreground">
                  HomeoRemedica
                </span>
              </Link>
              <div aria-hidden="true" className="rule-double mx-auto w-16" />
            </MotionSection>
          )}

          <MotionSection>
            <Card className={motionClassNames.surface}>
              {children}
            </Card>
          </MotionSection>
        </MotionRouteShell>
      </main>
    </div>
  );
}
