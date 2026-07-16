import type { Metadata } from 'next';

import { PreviewCasesScene } from '@/components/preview-cases-scene';

export const metadata: Metadata = {
  title: 'Saved cases preview',
  robots: { index: false, follow: false },
};

export default function CasesPreviewPage() {
  return <PreviewCasesScene />;
}
