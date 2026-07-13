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

  it('types a case before revealing its matched symptoms and remedies', async () => {
    render(<RemedyPreview />);

    expect(screen.getByLabelText('Case being searched')).toHaveValue('');
    expect(screen.queryByText('Arsenicum album')).not.toBeInTheDocument();

    await advanceDemo(2_000);

    expect(screen.getByLabelText('Case being searched')).toHaveValue(
      'burning pain, restless after midnight',
    );

    await advanceDemo(4_000);

    expect(screen.getByText('Burning pains, worse at night')).toBeInTheDocument();
    expect(screen.getByText('Arsenicum album')).toBeInTheDocument();
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
  });

  it('can pause and replay the demonstration', async () => {
    render(<RemedyPreview />);

    await advanceDemo(500);
    fireEvent.click(screen.getByRole('button', { name: 'Pause demonstration' }));
    const pausedQuery = screen.getByLabelText('Case being searched').getAttribute('value');

    await advanceDemo(3_000);
    expect(screen.getByLabelText('Case being searched')).toHaveValue(pausedQuery);

    fireEvent.click(screen.getByRole('button', { name: 'Replay demonstration' }));
    expect(screen.getByLabelText('Case being searched')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Pause demonstration' })).toBeInTheDocument();
  });
});
