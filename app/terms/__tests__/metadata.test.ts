import { describe, it } from 'vitest';

import { assertMetadata } from '../../__tests__/metadata-test-helper';
import { metadata } from '../page';

describe('Terms Page Metadata', () => {
  const cases = [
    {
      title: 'Terms and Conditions',
      description: 'Read the terms governing use of the HomeoRemedica website, API, accounts, saved cases, and Android app.',
      canonical: '/terms',
    },
  ];

  it.each(cases)('verifies title: $title, canonical: $canonical', (expected) => {
    assertMetadata(metadata, expected);
  });
});
