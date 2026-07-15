import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CasesPreview } from '@/components/cases-preview';

describe('CasesPreview', () => {
  it('shows saved cases and switches the active case', () => {
    render(<CasesPreview />);

    expect(screen.getByRole('region', { name: 'Saved cases preview' })).toHaveClass(
      'preview-device',
      'aspect-preview-mobile',
      'max-w-preview-mobile',
      'md:aspect-preview-desktop',
      'md:max-w-preview-desktop',
    );
    expect(screen.getByText('Showing 3 cases')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Night-time burning pain/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Night-time burning pain' })).toBeInTheDocument();
    expect(screen.getByText('Burning pains, worse at night')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Dry cough follow-up/i }));

    expect(screen.getByRole('button', { name: /Dry cough follow-up/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Dry cough follow-up' })).toBeInTheDocument();
    expect(screen.getByText('Dry cough, worse after midnight')).toBeInTheDocument();
    expect(screen.queryByText('Burning pains, worse at night')).not.toBeInTheDocument();
  });
});
