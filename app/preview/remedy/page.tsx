import type { Metadata } from 'next';

import { PreviewRemedyScene } from '@/components/preview-remedy-scene';

export const metadata: Metadata = {
  title: 'Remedy finder preview',
  robots: { index: false, follow: false },
};

export default function RemedyPreviewPage() {
  return <PreviewRemedyScene />;
}
