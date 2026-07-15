import type { Metadata } from 'next';
import Link from 'next/link';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { OrnamentRule } from '@/components/ui/ornament';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl space-y-6 text-center">
          <h1 className="display-md">Not in the ledger</h1>


          <p className="balanced-copy mx-auto max-w-md text-base leading-relaxed text-on-surface-variant">
            The page you requested is not catalogued here. Check the address for
            misprints, or return to the index.
          </p>

          <OrnamentRule className="mx-auto w-40" />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/find-remedy">Open symptom finder</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
