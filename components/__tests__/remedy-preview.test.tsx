import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RemedyPreview } from '@/components/remedy-preview';

describe('RemedyPreview', () => {
  it('renders the real finder experience in an isolated responsive viewport', () => {
    render(<RemedyPreview />);

    const preview = screen.getByRole('region', { name: 'Remedy finder demonstration' });
    const viewport = screen.getByTitle('Remedy finder demonstration');

    expect(preview).toHaveClass(
      'preview-device',
      'aspect-preview-mobile',
      'max-w-preview-mobile',
      'md:aspect-preview-desktop',
      'md:max-w-preview-desktop',
    );
    expect(viewport).toHaveAttribute('src', '/preview/remedy');
    expect(viewport).toHaveClass('preview-viewport');
  });
});
