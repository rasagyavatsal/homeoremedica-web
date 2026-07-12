export function getSiteUrl(): URL {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  if (typeof env === 'string' && env.length > 0) {
    try {
      const url = new URL(env);
      if (!url.hostname.endsWith('.web.app')) {
        return url;
      }
    } catch {
      // Ignore invalid URLs
    }
  }

  return new URL('https://homeoremedica.com')
}
