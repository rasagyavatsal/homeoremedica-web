import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { RemedyPreview } from '@/components/remedy-preview';
import { Button } from '@/components/ui/button';
import { MotionItem, MotionRouteShell } from '@/components/ui/motion';
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

const steps = [
  ['Search', 'Begin with a few plain symptom keywords.'],
  ['Select', 'Keep only the indications that describe the case.'],
  ['Compare', 'Review remedies ranked against the selected symptoms.'],
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="dilution-field border-b border-border">
          <MotionRouteShell className="page-shell min-h-viewport-below-header grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
            <div className="lg:col-span-7">
              <p className="index-label mb-6">Homoeopathic remedy research</p>
              <h1 className="display-hero max-w-4xl font-medium">
                A quieter way to find the remedy.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                Search symptoms across trusted classical sources, hold the important indications in view,
                and compare the remedies that meet them.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-3">
                  <Link href="/find-remedy">
                    Find a remedy
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <RemedyPreview />
            </div>
          </MotionRouteShell>
        </section>

        <section id="how-it-works" className="page-shell py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="index-label mb-5">A considered workflow</p>
              <h2 className="display-md">Less interface. More attention.</h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-on-surface-variant md:text-lg">
                The finder keeps one source, one symptom set, and one ranked result in the same quiet workspace.
              </p>
            </div>
            <div className="lg:col-span-7">
              {steps.map(([title, description], index) => (
                <MotionItem key={title} className="landing-step-grid grid gap-5 border-t border-border py-6 first:border-t-0">
                  <span className="index-label pt-1 text-primary">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-medium">{title}</h3>
                    <p className="mt-2 text-on-surface-variant">{description}</p>
                  </div>
                </MotionItem>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Classical sources" className="border-y border-border bg-surface-container-low">
          <div className="page-shell py-24 lg:py-32">
            <div className="mb-12 max-w-2xl">
              <p className="index-label mb-5">Classical sources</p>
              <h2 className="display-md">Four books. One clear place to search.</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {SEARCH_BOOKS.map((book, index) => {
                const cover = SOURCE_COVERS[book.id];
                return (
                  <article key={book.id} className="group bg-card p-5 md:p-6">
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <Image
                        src={cover.src}
                        alt=""
                        width={cover.width}
                        height={cover.height}
                        sizes="5rem"
                        className="h-24 w-auto rounded-sm object-cover opacity-80 grayscale transition duration-calm group-hover:opacity-100 group-hover:grayscale-0"
                      />
                      <span className="index-label text-primary">0{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-medium leading-title">{book.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{book.shortDescription}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="page-shell py-24 lg:py-32">
          <div className="quiet-panel dilution-field landing-cta-grid grid gap-10 overflow-hidden p-8 md:p-12 lg:items-end">
            <div>
              <p className="index-label mb-5">Begin when ready</p>
              <h2 className="display-md max-w-3xl">Give the case your full attention.</h2>
              <p className="mt-5 max-w-2xl text-on-surface-variant">
                Results are a reference for study and practitioner research, not medical diagnosis or treatment advice.
              </p>
            </div>
            <Button asChild size="lg" className="gap-3">
              <Link href="/find-remedy">
                Open the finder
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
