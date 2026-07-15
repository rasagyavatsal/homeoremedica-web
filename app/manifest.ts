import type { MetadataRoute } from 'next'
import { themeConfig } from '@/lib/theme-config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeoRemedica - Homoeopathic Remedy Finder',
    short_name: 'HomeoRemedica',
    description: 'A calm, focused homoeopathic remedy finder for searching classical materia medica by symptom.',
    start_url: '/',
    display: 'standalone',
    background_color: themeConfig.light.backgroundColor,
    theme_color: themeConfig.light.themeColor,
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/mark.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
    ],
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
        url: '/find-remedy',
      }
    ] as any,
    prefer_related_applications: false,
    lang: 'en-US',
    dir: 'ltr'
  } as any // cast to any to support standard web manifest properties that may be missing in Next.js type definitions
}
