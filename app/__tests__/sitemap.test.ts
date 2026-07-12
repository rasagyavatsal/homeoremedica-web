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
});
