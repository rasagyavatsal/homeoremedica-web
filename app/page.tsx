import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { CasesPreview } from '@/components/cases-preview';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroHeading } from '@/components/hero-heading';
import { RemedyPreview } from '@/components/remedy-preview';
import { Button } from '@/components/ui/button';
import { MotionRouteShell } from '@/components/ui/motion';
import { PLAY_STORE_URL } from '@/lib/constants/links';
import { SEARCH_BOOKS } from '@/lib/seo/book-data';

const HOME_DESCRIPTION =
  'A calm, focused homoeopathic remedy finder for searching classical materia medica by symptom and comparing matching remedies.';

export const metadata: Metadata = {
  title: 'HomeoRemedica — A calmer homoeopathic remedy finder',
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'HomeoRemedica — A calmer homoeopathic remedy finder',
    description: HOME_DESCRIPTION,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'HomeoRemedica — A quieter way to find the remedy.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HomeoRemedica — A calmer homoeopathic remedy finder',
    description: HOME_DESCRIPTION,
    images: ['/og.png'],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="dilution-field border-b border-border">
          <MotionRouteShell className="page-shell flex flex-col items-center py-20 lg:py-28">
            <div className="mx-auto max-w-5xl text-center">
              <HeroHeading />
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                Search symptoms across trusted classical sources, hold the important indications in view,
                and compare the remedies that meet them.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-3">
                  <Link href="/find-remedy">
                    Find a remedy
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                    Android app
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-16 w-full lg:mt-20">
              <RemedyPreview />
              <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-on-surface-variant">
                Results are a reference for study and practitioner research, not medical diagnosis or treatment advice.
              </p>
            </div>
          </MotionRouteShell>
        </section>

        <section aria-labelledby="how-to-search-heading" className="border-y border-border bg-card">
          <div className="page-shell py-24 lg:py-32">
            <div className="max-w-2xl">
              <h2 id="how-to-search-heading" className="display-md">
                How it works
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
                Type only keywords, not full sentences.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
              <article className="bg-background p-5 md:p-6">
                <p className="index-label mb-6 text-primary">Example 01</p>
                <div className="space-y-5">
                  <div>
                    <p className="index-label mb-2 text-destructive">Wrong</p>
                    <p className="text-on-surface-variant line-through decoration-destructive/60">
                      itching at night in bed
                    </p>
                  </div>
                  <div className="border-t border-border pt-5">
                    <p className="index-label mb-2 text-primary">Right</p>
                    <p className="font-code text-lg font-medium text-foreground">itching bed night</p>
                  </div>
                </div>
              </article>

              <article className="bg-background p-5 md:p-6">
                <p className="index-label mb-6 text-primary">Example 02</p>
                <div className="space-y-5">
                  <div>
                    <p className="index-label mb-2 text-destructive">Wrong</p>
                    <p className="text-on-surface-variant line-through decoration-destructive/60">
                      pain in the molar tooth aggravated by touching the cheek
                    </p>
                  </div>
                  <div className="border-t border-border pt-5">
                    <p className="index-label mb-2 text-primary">Right</p>
                    <p className="font-code text-lg font-medium text-foreground">toothache cheeks</p>
                  </div>
                </div>
              </article>
            </div>

            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              <li className="border-t border-border pt-5">
                <span className="index-label text-primary">01</span>
                <h3 className="mt-4 text-xl font-medium">Order doesn’t matter</h3>
                <p className="mt-3 text-on-surface-variant">
                  Enter the keywords in whichever order comes naturally.
                </p>
              </li>
              <li className="border-t border-border pt-5">
                <span className="index-label text-primary">02</span>
                <h3 className="mt-4 text-xl font-medium">Select every close match</h3>
                <p className="mt-3 text-on-surface-variant">
                  Choose all similar symptoms from the results.
                </p>
              </li>
              <li className="border-t border-border pt-5">
                <span className="index-label text-primary">03</span>
                <h3 className="mt-4 text-xl font-medium">Break complex symptoms apart</h3>
                <p className="mt-3 text-on-surface-variant">
                  If a symptom doesn’t appear, split it into smaller symptoms and search for each one separately.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section aria-label="Classical sources" className="border-y border-border bg-surface-container-low">
          <div className="page-shell py-24 lg:py-32">
            <div className="mb-12 max-w-2xl">
              <h2 className="display-md">Four books. One place to search.</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {SEARCH_BOOKS.map((book, index) => {
                const cover = book.cover;
                return (
                  <article key={book.id} className="bg-card p-5 md:p-6">
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <Image
                        src={cover.src}
                        alt=""
                        width={cover.width}
                        height={cover.height}
                        sizes="9rem"
                        className="h-48 w-36 rounded-sm object-cover"
                      />
                      <span className="index-label text-primary">0{index + 1}</span>
                    </div>
                    <h3 className="whitespace-pre-line text-lg font-medium leading-title">
                      {book.fullName}
                    </h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-label="Saved cases" className="dilution-field border-t border-border">
          <div className="page-shell py-24 lg:py-32">
            <div className="mb-12">
              <div>
                <h2 className="display-md max-w-3xl">Save cases. Pick up where you left off.</h2>
                <p className="mt-5 max-w-2xl text-on-surface-variant">
                  Save the source and selected symptoms together, then return to the case without rebuilding your research.
                </p>
              </div>
            </div>

            <CasesPreview />

            <div className="mt-6 flex justify-center">
              <Button asChild size="lg" className="gap-3">
                <Link href="/find-remedy">
                  Find Remedy
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
