import type { MetadataRoute } from 'next'
import { themeConfig } from '@/lib/theme-config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeoRemedica - Simple Homeopathic Repertory',
    short_name: 'HomeoRemedica',
    description: 'Simple Homeopathic Repertory - Search homeopathic remedies across classical repertories from Boericke, Clarke, Kent & Allen. Free symptom matching tool for practitioners and students.',
    start_url: '/',
    display: 'standalone',
    background_color: themeConfig.light.backgroundColor,
    theme_color: themeConfig.light.themeColor,
    orientation: 'portrait-primary',
    scope: '/',
    // id: 'homeoremedica', // Next.js types might not natively support all PWA fields yet, cast if necessary
    categories: [
      'health',
      'medical',
      'education'
    ] as any,
    shortcuts: [
      {
        name: 'Find Remedy',
        short_name: 'Find',
        description: 'Search symptoms and find remedies',
        url: '/',
      }
    ] as any,
    prefer_related_applications: false,
    lang: 'en-US',
    dir: 'ltr'
  } as any // cast to any to support standard web manifest properties that may be missing in Next.js type definitions
}
