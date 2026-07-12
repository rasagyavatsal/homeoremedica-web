import type { Metadata } from 'next'
import FindRemedyClient from '@/components/find-remedy-client'
import { FIND_REMEDY_FAQ_ITEMS, FIND_REMEDY_HERO_DESCRIPTION } from '@/lib/seo/find-remedy-content'

export const metadata: Metadata = {
  title: 'Homeopathic Remedy Finder - HomeoRemedica',
  description: FIND_REMEDY_HERO_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Homeopathic Remedy Finder - HomeoRemedica',
    description: FIND_REMEDY_HERO_DESCRIPTION,
    url: '/',
  },
}

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FIND_REMEDY_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FindRemedyClient />
    </>
  )
}
