import Link from 'next/link';

import { BrandLockup } from '@/components/brand-lockup';
import { InlineLink } from '@/components/ui/interactive';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rasagyavatsal.homeoremedica';

export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const year = new Date().getFullYear();

  return (
    <footer className="safe-bottom border-t border-border">
      <div className="page-shell flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <Link href="/" aria-label="HomeoRemedica home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2 font-code text-xs text-on-surface-variant">
            <span>© {year} HomeoRemedica</span>
            {version ? <><span aria-hidden="true">·</span><span>v{version}</span></> : null}
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer">
          <InlineLink href="/find-remedy" className="-mx-1.5 text-sm text-on-surface-variant">Find Remedy</InlineLink>
          <InlineLink href={PLAY_STORE_URL} external className="-mx-1.5 text-sm text-on-surface-variant">Android App</InlineLink>
          <InlineLink href="/privacy" className="-mx-1.5 text-sm text-on-surface-variant">Privacy</InlineLink>
          <InlineLink href="/contact" className="-mx-1.5 text-sm text-on-surface-variant">Contact</InlineLink>
        </nav>
      </div>
    </footer>
  );
}
