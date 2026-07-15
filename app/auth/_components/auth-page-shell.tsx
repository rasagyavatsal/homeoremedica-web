"use client";

import Link from 'next/link';

import { BrandLockup } from '@/components/brand-lockup';
import { Card } from '@/components/ui/card';
import { MotionRouteShell, MotionSection } from '@/components/ui/motion';
import { motionClassNames } from '@/lib/motion/system';

interface AuthPageShellProps {
  readonly children: React.ReactNode;
  readonly showBrand?: boolean;
}

export function AuthPageShell({ children, showBrand = true }: AuthPageShellProps) {
  return (
    <div className="dilution-field min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <main className="mx-auto flex min-h-screen max-w-content items-center justify-center">
        <MotionRouteShell className="w-full max-w-dialog space-y-6">
          {showBrand && (
            <MotionSection className="text-center">
              <Link href="/" className="inline-flex min-h-touch items-center justify-center">
                <BrandLockup />
              </Link>
            </MotionSection>
          )}

          <MotionSection>
            <Card className={`shadow-overlay ${motionClassNames.surface}`}>
              {children}
            </Card>
          </MotionSection>
        </MotionRouteShell>
      </main>
    </div>
  );
}
