import type { Metadata } from 'next';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { TermsClient } from './terms-client';

const description = 'Read the terms governing use of the HomeoRemedica website, API, accounts, saved cases, and Android app.';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description,
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms and Conditions',
    description,
    url: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <TermsClient />
      <Footer />
    </div>
  );
}
