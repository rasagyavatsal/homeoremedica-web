import { describe, expect, it } from 'vitest';

import { metadata as rootMetadata } from '../layout';
import { metadata as homeMetadata } from '../page';
import { metadata as chatMetadata } from '../chat/page';

const ROOT_DESCRIPTION =
  'A calm, focused homoeopathic reference chat over classical materia medica, with every answer grounded in cited source passages.';

describe('metadata positioning copy', () => {
  it('positions the product as a calm homoeopathic reference tool', () => {
    const title = rootMetadata.title;
    if (!title || typeof title !== 'object' || !('default' in title)) {
      throw new Error('Expected root metadata title to be an object with default value');
    }

    expect(title.default).toBe('HomeoRemedica — Homoeopathic Remedy Finder');
    expect(rootMetadata.description).toBe(ROOT_DESCRIPTION);
    expect(rootMetadata.openGraph?.description).toBe(ROOT_DESCRIPTION);
  });

  it('gives the landing page and chat distinct canonical URLs', () => {
    expect(homeMetadata.alternates?.canonical).toBe('/');
    expect(homeMetadata.title).toBe('HomeoRemedica - Homeopathic Remedy Finder');
    expect(chatMetadata.alternates?.canonical).toBe('/chat');
    expect(chatMetadata.title).toBe('Chat with the materia medica');
  });

  it('provides theme-aware browser icons from the new logo set', () => {
    expect(rootMetadata.icons).toEqual({
      icon: [
        {
          url: '/logo/logo-light-transparent.png',
          type: 'image/png',
          sizes: '860x860',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/logo/logo-dark-transparent.png',
          type: 'image/png',
          sizes: '860x860',
          media: '(prefers-color-scheme: dark)',
        },
      ],
      apple: [{ url: '/logo/logo-light.png', type: 'image/png', sizes: '860x860' }],
    });
  });
});
