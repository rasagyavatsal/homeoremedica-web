import { describe, expect, it } from 'vitest';

import manifest from '../manifest';

describe('web manifest branding', () => {
  it('uses the new logo as the installable app icon', () => {
    expect(manifest().icons).toEqual([
      {
        src: '/logo/logo-light.png',
        sizes: '860x860',
        type: 'image/png',
        purpose: 'any',
      },
    ]);
  });
});
