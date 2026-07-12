import { describe, it } from 'vitest';
import { metadata } from '../page';
import { assertMetadata } from '../../__tests__/metadata-test-helper';

describe('Contact Page Metadata', () => {
  const cases = [
    {
      title: 'Contact Us - HomeoRemedica',
      description: 'Contact HomeoRemedica for support, feedback, questions, or help with the homeopathic remedy finder.',
      canonical: '/contact',
    },
  ];

  it.each(cases)('verifies title: $title, canonical: $canonical', (expected) => {
    assertMetadata(metadata, expected);
  });
});
