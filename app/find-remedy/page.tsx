import type { Metadata } from 'next';

import FindRemedyClient from '@/components/find-remedy-client';
import { FIND_REMEDY_HERO_DESCRIPTION } from '@/lib/seo/find-remedy-content';

export const metadata: Metadata = {
  title: 'Find a homoeopathic remedy',
  description: FIND_REMEDY_HERO_DESCRIPTION,
  alternates: { canonical: '/find-remedy' },
  openGraph: {
    title: 'Find a homoeopathic remedy — HomeoRemedica',
    description: FIND_REMEDY_HERO_DESCRIPTION,
    url: '/find-remedy',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'HomeoRemedica — A quieter way to find the remedy.' }],
  },
};

export default function FindRemedyPage() {
  return <FindRemedyClient />;
}
