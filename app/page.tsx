import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroHeading } from '@/components/hero-heading';
import { Button } from '@/components/ui/button';
import { MotionRouteShell } from '@/components/ui/motion';
import { PLAY_STORE_URL } from '@/lib/constants/links';
import { SEARCH_BOOKS } from '@/lib/seo/book-data';

const HOME_DESCRIPTION =
  'A calm, focused homoeopathic reference chat over classical materia medica, with every answer grounded in cited source passages.';

export const metadata: Metadata = {
  title: 'HomeoRemedica - Homoeopathic Reference Chat',
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'HomeoRemedica — A calmer homoeopathic reference chat',
    description: HOME_DESCRIPTION,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'HomeoRemedica — A quieter way to study the materia medica.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HomeoRemedica — A calmer homoeopathic reference chat',
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
                Ask about a remedy or symptom. Every answer cites the passages it comes from.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-3">
                  <Link href="/chat">
                    Open chat
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

          </MotionRouteShell>
        </section>

        <section aria-labelledby="how-to-ask-heading" className="border-y border-border bg-card">
          <div className="page-shell py-24 lg:py-32">
            <div className="max-w-2xl">
              <h2 id="how-to-ask-heading" className="display-md">
                How it works
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
                Ask in plain language. Full sentences work here.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
              <article className="bg-background p-5 md:p-6">
                <p className="index-label mb-6 text-primary">Example 01</p>
                <p className="text-lg font-medium leading-relaxed text-foreground">
                  How does Kent describe the temper of Nux vomica?
                </p>
              </article>

              <article className="bg-background p-5 md:p-6">
                <p className="index-label mb-6 text-primary">Example 02</p>
                <p className="text-lg font-medium leading-relaxed text-foreground">
                  Which remedies does Clarke list for sleeplessness?
                </p>
              </article>
            </div>

            <div className="mt-10 grid gap-8 text-on-surface-variant md:grid-cols-3">
              <p className="border-t border-border pt-5 leading-relaxed">
                Answers draw only from the four source books and cite the passages used.
              </p>
              <p className="border-t border-border pt-5 leading-relaxed">
                Follow-up questions keep the thread, so a remedy can be narrowed step by step.
              </p>
              <p className="border-t border-border pt-5 leading-relaxed">
                The books are historical reference, not medical advice.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Classical sources" className="border-y border-border bg-surface-container-low">
          <div className="page-shell py-24 lg:py-32">
            <div className="mb-12 max-w-3xl">
              <h2 className="display-md">Four books. Every answer cited.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                Each answer is grounded in passages from these books, listed under the answer with
                their book, remedy, and section. The books use different wording, so the same
                question can surface different voices.
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

            <div className="mt-10 flex justify-center">
              <Button asChild size="lg" className="gap-3">
                <Link href="/chat">
                  Open chat
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
