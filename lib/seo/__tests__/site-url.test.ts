import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getSiteUrl } from '../site-url';

describe('getSiteUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('defaults to https://homeoremedica.com when no env vars are set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    const url = getSiteUrl();
    expect(url.origin).toBe('https://homeoremedica.com');
  });

  it('ignores stale firebase .web.app domains', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://homeoremedica.web.app';
    const url = getSiteUrl();
    expect(url.origin).toBe('https://homeoremedica.com');
  });

  it('ignores stale firebase -1a78d.web.app domains', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://homoeoremedica-1a78d.web.app';
    const url = getSiteUrl();
    expect(url.origin).toBe('https://homeoremedica.com');
  });

  it('uses explicitly provided valid production url', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://some-other-valid-domain.com';
    const url = getSiteUrl();
    expect(url.origin).toBe('https://some-other-valid-domain.com');
  });

  it('falls back to NEXT_PUBLIC_APP_URL if NEXT_PUBLIC_SITE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_APP_URL = 'https://app-url-domain.com';
    const url = getSiteUrl();
    expect(url.origin).toBe('https://app-url-domain.com');
  });

  it('ignores stale firebase domains in NEXT_PUBLIC_APP_URL', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_APP_URL = 'https://homeoremedica.web.app';
    const url = getSiteUrl();
    expect(url.origin).toBe('https://homeoremedica.com');
  });
});
