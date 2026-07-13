import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RemedyPreview } from '@/components/remedy-preview';

async function advanceDemo(milliseconds: number) {
  for (let elapsed = 0; elapsed < milliseconds; elapsed += 50) {
    await act(() => vi.advanceTimersByTimeAsync(50));
  }
}

describe('RemedyPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('types beside its caret before revealing selected symptoms and matching remedies', async () => {
    render(<RemedyPreview />);

    const query = screen.getByLabelText('Case being searched');
    expect(query).toHaveTextContent('');
    expect(query.lastElementChild).toHaveClass('preview-cursor');
    expect(screen.queryByText('Arsenicum album')).not.toBeInTheDocument();

    await advanceDemo(2_000);

    expect(query).toHaveTextContent('burning pain at night');
    expect(screen.getByText('Selected symptoms')).toBeInTheDocument();

    await advanceDemo(4_000);

    expect(screen.getByText('Burning pains, worse at night')).toBeInTheDocument();
    expect(screen.getByText('Arsenicum album')).toBeInTheDocument();
    expect(screen.getByText('Matches 3 of 3')).toBeInTheDocument();
    expect(screen.getByText('Matching remedies')).toBeInTheDocument();
    expect(screen.getAllByText('Boericke').length).toBeGreaterThan(0);
  });

  it('rotates through more than one symptom case', async () => {
    render(<RemedyPreview />);

    await advanceDemo(9_000);

    expect(screen.getByLabelText('Case being searched')).toHaveTextContent(/^dry cough/);
  });

  it('can pause and replay the demonstration', async () => {
    render(<RemedyPreview />);

    await advanceDemo(500);
    fireEvent.click(screen.getByRole('button', { name: 'Pause demonstration' }));
    const pausedQuery = screen.getByLabelText('Case being searched').textContent;

    await advanceDemo(3_000);
    expect(screen.getByLabelText('Case being searched')).toHaveTextContent(pausedQuery ?? '');

    fireEvent.click(screen.getByRole('button', { name: 'Replay demonstration' }));
    expect(screen.getByLabelText('Case being searched')).toHaveTextContent('');
    expect(screen.getByRole('button', { name: 'Pause demonstration' })).toBeInTheDocument();
  });
});
