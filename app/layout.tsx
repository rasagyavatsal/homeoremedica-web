import './globals.css'
import { Providers } from './providers'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { themePolicy } from '@/lib/theme'
import { themeConfig } from '@/lib/theme-config'
import { FIND_REMEDY_HERO_DESCRIPTION } from '@/lib/seo/find-remedy-content'
import { getSiteUrl } from '@/lib/seo/site-url'

const SITE_NAME = 'HomeoRemedica'



const SITE_URL = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: 'HomeoRemedica - Homeopathic Remedy Finder',
    template: `%s | ${SITE_NAME}`,
  },
  description: FIND_REMEDY_HERO_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'HomeoRemedica - Homeopathic Remedy Finder',
    description: FIND_REMEDY_HERO_DESCRIPTION,
    url: '/',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HomeoRemedica - Homeopathic Remedy Finder',
    description: FIND_REMEDY_HERO_DESCRIPTION,
    images: ['/logo.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  icons: {
    icon: [
      { url: '/favicon.avif', type: 'image/avif' },
      { url: '/favicon.png', type: 'image/png' }
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themeConfig.light.themeColor },
    { media: '(prefers-color-scheme: dark)', color: themeConfig.dark.themeColor },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const themeBootstrapScript = themePolicy.createBootstrapScript()

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL.origin}/?search_term_string={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL.origin,
    logo: `${SITE_URL.origin}/favicon.png`,
  }

  const softwareAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL.origin,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: FIND_REMEDY_HERO_DESCRIPTION,
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-bootstrap"
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      </head>
      <body suppressHydrationWarning className="font-body antialiased">
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script
              id="ga4"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${gaId}');`,
              }}
            />
          </>
        ) : null}
        <Providers>
          {children}
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteJsonLd, organizationJsonLd, softwareAppJsonLd]),
          }}
        />
      </body>
    </html>
  )
}
