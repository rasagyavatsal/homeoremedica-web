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

  it('types symptom keywords instead of sentences', async () => {
    vi.useFakeTimers();
    render(<PreviewRemedyScene />);

    const queries = ['burning pain night', 'dry cough night', 'throbbing headache sunlight'];

    for (const [index, query] of queries.entries()) {
      for (const _character of query) {
        await act(async () => {
          vi.runOnlyPendingTimers();
        });
      }

      expect(screen.getByRole('textbox', { name: 'Search symptom keywords' })).toHaveValue(query);

      if (index < queries.length - 1) {
        for (let step = 0; step < 7; step += 1) {
          await act(async () => {
            vi.runOnlyPendingTimers();
          });
        }
      }
    }
  });

  it('shows selected symptoms and remedy results together after selection', async () => {
    vi.useFakeTimers();
    render(<PreviewRemedyScene />);

    for (let step = 0; step < 'burning pain night'.length + 3; step += 1) {
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
