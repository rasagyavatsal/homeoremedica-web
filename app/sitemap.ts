import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()

  // Static core pages
  const coreUrls = [
    { url: `${siteUrl.origin}/`, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${siteUrl.origin}/find-remedy`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${siteUrl.origin}/contact`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${siteUrl.origin}/terms`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${siteUrl.origin}/privacy`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return coreUrls
}
