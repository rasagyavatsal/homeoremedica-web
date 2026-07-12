import Link from 'next/link';

import { InlineLink } from '@/components/ui/interactive';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rasagyavatsal.homeoremedica';

export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto safe-bottom">
      <div aria-hidden="true" className="rule-double" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-7 sm:flex-row sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Link href="/" className="inline-flex items-center gap-3">
            <picture>
              <source srcSet="/favicon.avif" type="image/avif" />
              <img src="/favicon.png" alt="" className="h-8 w-8 rounded-sm border border-foreground/15" />
            </picture>
            <p className="font-display text-base font-medium tracking-display text-foreground">HomeoRemedica</p>
          </Link>

          <div className="flex items-center gap-2 font-code text-xs tracking-[0.08em] text-on-surface-variant">
            <p>© {year} HomeoRemedica</p>
            {version ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <p>v{version}</p>
              </>
            ) : null}
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end" aria-label="Footer">
          <InlineLink href="/" className="-mx-1.5 text-sm text-on-surface-variant">Find Remedy</InlineLink>
          <InlineLink href={PLAY_STORE_URL} external className="-mx-1.5 text-sm text-on-surface-variant">
            Android App
          </InlineLink>
          <InlineLink href="/privacy" className="-mx-1.5 text-sm text-on-surface-variant">Privacy</InlineLink>
          <InlineLink href="/contact" className="-mx-1.5 text-sm text-on-surface-variant">Contact</InlineLink>
        </nav>
      </div>
    </footer>
  );
}
