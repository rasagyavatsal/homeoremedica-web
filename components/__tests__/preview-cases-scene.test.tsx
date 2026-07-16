import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PreviewCasesScene } from '@/components/preview-cases-scene';

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header" />,
}));

describe('PreviewCasesScene', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('demonstrates saving a current search and restoring another saved case', () => {
    vi.useFakeTimers();
    render(<PreviewCasesScene />);

    expect(screen.getByText('Burning pains, worse at night')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1_400));
    const saveDialog = screen.getByRole('dialog', { name: 'Save case' });
    const caseName = within(saveDialog).getByLabelText('Case name');

    for (const _character of 'Night-time burning pain') {
      act(() => vi.advanceTimersByTime(45));
    }
    expect(caseName).toHaveValue('Night-time burning pain');

    act(() => vi.advanceTimersByTime(1_000));
    const casesDialog = screen.getByRole('dialog', { name: 'Saved cases' });
    expect(within(casesDialog).getByText('Night-time burning pain')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Dry cough, worse after midnight')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Source Clarke' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3_000));
    const reopenedCases = screen.getByRole('dialog', { name: 'Saved cases' });
    expect(
      within(reopenedCases).getByRole('button', { name: /^Dry cough follow-up/ }).parentElement,
    ).toHaveClass('bg-accent');
  });

  it('keeps the case workflow manually interactive', () => {
    vi.useFakeTimers();
    render(<PreviewCasesScene />);

    fireEvent.click(screen.getByRole('button', { name: 'Save case' }));
    const saveDialog = screen.getByRole('dialog', { name: 'Save case' });
    fireEvent.change(within(saveDialog).getByLabelText('Case name'), {
      target: { value: 'Manual preview case' },
    });
    act(() => vi.advanceTimersByTime(500));
    expect(within(saveDialog).getByLabelText('Case name')).toHaveValue('Manual preview case');
    fireEvent.click(within(saveDialog).getByRole('button', { name: 'Save case' }));

    const casesDialog = screen.getByRole('dialog', { name: 'Saved cases' });
    expect(within(casesDialog).getByText('Manual preview case')).toBeInTheDocument();

    fireEvent.click(within(casesDialog).getByText('Sunlight headache'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Throbbing pain in the temples')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Source Kent' })).toBeInTheDocument();
  });
});
