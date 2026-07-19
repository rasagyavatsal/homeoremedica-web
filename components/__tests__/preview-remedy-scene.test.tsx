import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PreviewRemedyScene } from '@/components/preview-remedy-scene';

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header" />,
}));

describe('PreviewRemedyScene', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('omits global navigation from the embedded preview', () => {
    render(<PreviewRemedyScene />);

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('shows selected symptoms and remedy results together after selection', async () => {
    vi.useFakeTimers();
    render(<PreviewRemedyScene />);

    for (let step = 0; step < 'burning pain at night'.length + 3; step += 1) {
      await act(async () => {
        vi.runOnlyPendingTimers();
      });
    }

    fireEvent.click(screen.getByText('Burning pains, worse at night'));
    fireEvent.click(screen.getByText('Restlessness after midnight'));
    fireEvent.click(screen.getByText('Thirst for small quantities'));

    expect(screen.getByText('Selected symptoms')).toBeInTheDocument();
    expect(screen.getByText('Matching remedies')).toBeInTheDocument();
  });
});
