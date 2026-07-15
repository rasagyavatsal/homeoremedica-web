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

const SOURCE_COVERS = {
  boericke: { src: '/source-covers/boericke.jpg', width: 301, height: 371 },
  clarke: { src: '/source-covers/clarke.jpg', width: 298, height: 411 },
  kent: { src: '/source-covers/kent.jpg', width: 366, height: 543 },
  allen: { src: '/source-covers/allen.jpg', width: 223, height: 275 },
} as const;

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
            </div>
          </MotionRouteShell>
        </section>

        <section aria-label="Classical sources" className="border-y border-border bg-surface-container-low">
          <div className="page-shell py-24 lg:py-32">
            <div className="mb-12 max-w-2xl">
              <h2 className="display-md">Four books. One place to search.</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {SEARCH_BOOKS.map((book, index) => {
                const cover = SOURCE_COVERS[book.id];
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
                    <h3 className="text-lg font-medium leading-title">{book.name}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-label="Saved cases" className="dilution-field border-t border-border">
          <div className="page-shell py-24 lg:py-32">
            <div className="cases-heading-grid mb-12 grid gap-8 lg:items-end">
              <div>
                <h2 className="display-md max-w-3xl">Give the case your full attention.</h2>
                <p className="mt-5 max-w-2xl text-on-surface-variant">
                  Save the source and selected symptoms together, then return to the case without rebuilding your research.
                </p>
              </div>
              <Button asChild size="lg" className="w-fit gap-3">
                <Link href="/find-remedy">
                  Open the finder
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <CasesPreview />

            <p className="mt-6 max-w-3xl text-sm text-on-surface-variant">
              Results are a reference for study and practitioner research, not medical diagnosis or treatment advice.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
