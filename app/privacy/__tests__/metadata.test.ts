import { describe, it } from 'vitest';
import { metadata } from '../page';
import { assertMetadata } from '../../__tests__/metadata-test-helper';

describe('Privacy Page Metadata', () => {
  const cases = [
    {
      title: 'Privacy Policy - HomeoRemedica',
      description: 'Learn how HomeoRemedica handles account, chat, and usage data for the homoeopathic reference chat.',
      canonical: '/privacy',
    },
  ];

  it.each(cases)('verifies title: $title, canonical: $canonical', (expected) => {
    assertMetadata(metadata, expected);
  });
});
