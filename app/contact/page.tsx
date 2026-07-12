import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Metadata } from 'next';
import { ContactClient } from './contact-client';

export const metadata: Metadata = {
  title: 'Contact Us - HomeoRemedica',
  description: 'Contact HomeoRemedica for support, feedback, questions, or help with the homeopathic remedy finder.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - HomeoRemedica',
    description: 'Contact HomeoRemedica for support, feedback, questions, or help with the homeopathic remedy finder.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      
      <ContactClient />

      <Footer />
    </div>
  );
}
