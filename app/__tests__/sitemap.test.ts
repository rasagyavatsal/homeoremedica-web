import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/seo/site-url', () => ({
  getSiteUrl: () => new URL('https://homeoremedica.com'),
}));

import sitemap from '../sitemap';

describe('sitemap', () => {
  it('excludes removed remedy and reference-book pages', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls.some((url) => url.includes('/book/'))).toBe(false);
    expect(urls.some((url) => url.includes('/remedies'))).toBe(false);
    expect(urls.some((url) => url.includes('/remedy/'))).toBe(false);
  });

  it('includes the dedicated finder route', () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain('https://homeoremedica.com/find-remedy');
  });

  it('includes both legal pages', () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain('https://homeoremedica.com/privacy');
    expect(urls).toContain('https://homeoremedica.com/terms');
  });
});
