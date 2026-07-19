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
  title: 'HomeoRemedica - Homeopathic Remedy Finder',
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
        <section className="border-b border-border">
          <MotionRouteShell className="page-shell flex flex-col items-center py-20 lg:py-28">
            <div className="mx-auto max-w-5xl text-center">
              <HeroHeading />
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                Search by symptom. Choose the closest matches. Compare the remedies.
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
                Use a few distinct words rather than a full sentence. Start with the symptom, then add where or when it
                happens.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
              <article className="bg-background p-5 md:p-6">
                <p className="index-label mb-6 text-primary">Example 01</p>
                <div className="space-y-5">
                  <div>
                    <p className="index-label mb-2 text-destructive">Full sentence</p>
                    <p className="text-on-surface-variant line-through decoration-destructive/60">
                      itching at night in bed
                    </p>
                  </div>
                  <div className="border-t border-border pt-5">
                    <p className="index-label mb-2 text-primary">Search words</p>
                    <p className="font-code text-lg font-medium text-foreground">itching bed night</p>
                  </div>
                </div>
              </article>

              <article className="bg-background p-5 md:p-6">
                <p className="index-label mb-6 text-primary">Example 02</p>
                <div className="space-y-5">
                  <div>
                    <p className="index-label mb-2 text-destructive">Full sentence</p>
                    <p className="text-on-surface-variant line-through decoration-destructive/60">
                      pain in the molar tooth aggravated by touching the cheek
                    </p>
                  </div>
                  <div className="border-t border-border pt-5">
                    <p className="index-label mb-2 text-primary">Search words</p>
                    <p className="font-code text-lg font-medium text-foreground">toothache cheeks</p>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-10 grid gap-8 text-on-surface-variant md:grid-cols-3">
              <p className="border-t border-border pt-5 leading-relaxed">
                The order of the words is not important. Type them in whichever order they come to mind.
              </p>
              <p className="border-t border-border pt-5 leading-relaxed">
                A book may describe the same symptom in more than one way. Select each result that matches what you
                mean.
              </p>
              <p className="border-t border-border pt-5 leading-relaxed">
                If a long symptom does not appear, search its parts separately and add the useful entries one by one.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Classical sources" className="border-y border-border bg-surface-container-low">
          <div className="page-shell py-24 lg:py-32">
            <div className="mb-12 max-w-3xl">
              <h2 className="display-md">Four books. One place to search.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                Search one book at a time. The symptoms and remedies you see come from the selected book, which keeps
                each author’s wording intact.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-2">
              {SEARCH_BOOKS.map((book, index) => {
                const cover = book.cover;
                return (
                  <article key={book.id} className="bg-card p-5 md:p-6">
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div>
                        <Image
                          src={cover.src}
                          alt=""
                          width={cover.width}
                          height={cover.height}
                          sizes="9rem"
                          className="h-48 w-36 rounded-sm object-cover"
                        />
                        <span className="index-label mt-4 block text-primary">Source 0{index + 1}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="whitespace-pre-line text-lg font-medium leading-title">
                          {book.fullName}
                        </h3>
                        <p className="mt-5 leading-relaxed text-on-surface-variant">
                          {book.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-label="Saved cases" className="border-t border-border">
          <div className="page-shell py-24 lg:py-32">
            <div className="mb-12 max-w-3xl">
              <h2 className="display-md max-w-3xl">Save cases. Pick up where you left off.</h2>
              <div className="mt-5 max-w-2xl space-y-5 text-lg leading-relaxed text-on-surface-variant">
                <p>
                  Give the case a name once you have selected the symptoms you want to keep. It will appear in Saved
                  cases with its date, source book, and symptom count.
                </p>
                <p>
                  Open it again and HomeoRemedica switches back to that source and restores the selected symptoms. You
                  can review them as they were or carry on searching.
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
