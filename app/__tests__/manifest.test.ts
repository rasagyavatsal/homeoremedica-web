import { describe, expect, it } from 'vitest';

import manifest from '../manifest';

describe('web manifest branding', () => {
  it('uses the new logo as the installable app icon', () => {
    expect(manifest().icons).toEqual([
      {
        src: '/logo/pwa-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo/pwa-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo/pwa-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ]);
  });
});
