import { expect } from 'vitest';

export interface ExpectedMetadata {
  title: string;
  description: string;
  canonical: string;
}

export function assertMetadata(metadata: any, expected: ExpectedMetadata) {
  expect(metadata.title).toBe(expected.title);
  expect(metadata.description).toBe(expected.description);
  expect(metadata.alternates?.canonical).toBe(expected.canonical);
  
  expect(metadata.openGraph?.title).toBe(expected.title);
  expect(metadata.openGraph?.description).toBe(expected.description);
  expect(metadata.openGraph?.url).toBe(expected.canonical);
}
