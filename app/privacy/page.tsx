import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Metadata } from 'next';
import { PrivacyClient } from './privacy-client';

export const metadata: Metadata = {
  title: 'Privacy Policy - HomeoRemedica',
  description: 'Learn how HomeoRemedica handles account, case, symptom, and usage data for the homeopathic remedy finder.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - HomeoRemedica',
    description: 'Learn how HomeoRemedica handles account, case, symptom, and usage data for the homeopathic remedy finder.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <PrivacyClient />

      <Footer />
    </div>
  );
}
