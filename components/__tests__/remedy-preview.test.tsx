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

  it('uses the live finder search control before revealing selected symptoms and matching remedies', async () => {
    render(<RemedyPreview />);

    const query = screen.getByRole('textbox', { name: 'Search symptom keywords' });
    expect(query).toHaveValue('');
    expect(query).toHaveAttribute('placeholder', 'Search symptom keywords…');
    expect(screen.queryByText('Arsenicum album')).not.toBeInTheDocument();

    await advanceDemo(2_000);

    expect(query).toHaveValue('burning pain at night');
    expect(screen.getByText('Selected symptoms')).toBeInTheDocument();

    await advanceDemo(4_000);

    expect(screen.getByText('Burning pains, worse at night')).toBeInTheDocument();
    expect(screen.getByText('Arsenicum Album')).toBeInTheDocument();
    expect(screen.getByText('Matches 3 of 3')).toBeInTheDocument();
    expect(screen.getByText('Matching remedies')).toBeInTheDocument();
    expect(screen.getAllByText('Boericke').length).toBeGreaterThan(0);
    expect(screen.getByText(/These results are for reference only/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Find remedies/i })).not.toBeInTheDocument();
  });

  it('opens a matching-indications dropdown before selecting symptoms', async () => {
    render(<RemedyPreview />);

    await advanceDemo(1_500);

    expect(document.querySelector('[data-slot="search-backdrop"]')).toHaveClass('absolute', 'inset-0');
    expect(document.querySelector('.preview-workspace')).toHaveClass('relative');
    expect(screen.getByText('Matching indications')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Burning|Restlessness|Thirst/ })).toHaveLength(3);
    expect(screen.getByText('3 indications')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close search' })).toBeInTheDocument();
  });

  it('rotates through more than one symptom case', async () => {
    render(<RemedyPreview />);

    await advanceDemo(9_000);

    expect(
      (screen.getByRole('textbox', { name: 'Search symptom keywords' }) as HTMLInputElement).value,
    ).toMatch(/^dry cough/);
  });

  it('can pause and replay the demonstration', async () => {
    render(<RemedyPreview />);

    await advanceDemo(500);
    fireEvent.click(screen.getByRole('button', { name: 'Pause demonstration' }));
    const pausedQuery = screen.getByRole('textbox', { name: 'Search symptom keywords' }).getAttribute('value');

    await advanceDemo(3_000);
    expect(screen.getByRole('textbox', { name: 'Search symptom keywords' })).toHaveValue(pausedQuery ?? '');

    fireEvent.click(screen.getByRole('button', { name: 'Replay demonstration' }));
    expect(screen.getByRole('textbox', { name: 'Search symptom keywords' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Pause demonstration' })).toBeInTheDocument();
  });
});
