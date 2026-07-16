import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CasesPreview } from '@/components/cases-preview';

describe('CasesPreview', () => {
  it('renders the real Saved Cases experience in an isolated responsive viewport', () => {
    render(<CasesPreview />);

    const preview = screen.getByRole('region', { name: 'Saved cases preview' });
    const viewport = screen.getByTitle('Saved cases preview');

    expect(preview).toHaveClass(
      'preview-device',
      'aspect-preview-mobile',
      'max-w-preview-mobile',
      'md:aspect-preview-desktop',
      'md:max-w-preview-desktop',
    );
    expect(viewport).toHaveAttribute('src', '/preview/cases');
    expect(viewport).toHaveClass('preview-viewport');
  });
});
