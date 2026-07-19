import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PreviewCasesScene } from '@/components/preview-cases-scene';

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header" />,
}));

describe('PreviewCasesScene', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('omits global navigation from the embedded preview', () => {
    render(<PreviewCasesScene />);

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('demonstrates saving, clearing, and visibly reopening the created case', () => {
    vi.useFakeTimers();
    render(<PreviewCasesScene />);

    expect(screen.getByText('Burning pains, worse at night')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1_400));
    const saveDialog = screen.getByRole('dialog', { name: 'Save case' });
    const caseName = within(saveDialog).getByLabelText('Case name');

    for (const _character of 'Priya, 40 F') {
      act(() => vi.advanceTimersByTime(45));
    }
    expect(caseName).toHaveValue('Priya, 40 F');

    act(() => vi.advanceTimersByTime(1_000));
    expect(within(saveDialog).getByRole('button', { name: 'Saving...' })).toBeDisabled();

    act(() => vi.advanceTimersByTime(600));
    const casesDialog = screen.getByRole('dialog', { name: 'Saved cases' });
    expect(within(casesDialog).getByText('Priya, 40 F')).toBeInTheDocument();
    expect(within(casesDialog).getByText('Ethan, 26 M')).toBeInTheDocument();
    expect(within(casesDialog).getByText('Meera, 34 F')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1_800));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Burning pains, worse at night')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Matching remedies' })).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1_000));
    const reopenedCases = screen.getByRole('dialog', { name: 'Saved cases' });
    const createdCase = within(reopenedCases).getByRole('button', { name: /^Priya, 40 F/ });
    expect(createdCase.parentElement).not.toHaveClass('bg-accent');

    act(() => vi.advanceTimersByTime(1_500));
    expect(createdCase.parentElement).toHaveClass('bg-accent');

    act(() => vi.advanceTimersByTime(700));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByText('Burning pains, worse at night'),
    ).toBeInTheDocument();
  });

  it('does not move focus while dialogs autoplay', () => {
    vi.useFakeTimers();
    render(
      <>
        <button type="button">Outside preview</button>
        <PreviewCasesScene />
      </>,
    );

    const outsidePreview = screen.getByRole('button', { name: 'Outside preview' });
    outsidePreview.focus();

    act(() => vi.advanceTimersByTime(1_400));
    expect(screen.getByRole('dialog', { name: 'Save case' })).toBeInTheDocument();
    expect(document.activeElement).toBe(outsidePreview);

    for (const _character of 'Priya, 40 F') {
      act(() => vi.advanceTimersByTime(45));
    }
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole('dialog', { name: 'Save case' })).toBeInTheDocument();
    expect(document.activeElement).toBe(outsidePreview);

    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole('dialog', { name: 'Saved cases' })).toBeInTheDocument();
    expect(document.activeElement).toBe(outsidePreview);

    act(() => vi.advanceTimersByTime(1_800));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(outsidePreview);
  });

  it('keeps the case workflow manually interactive', () => {
    vi.useFakeTimers();
    render(<PreviewCasesScene />);

    fireEvent.click(screen.getByRole('button', { name: 'Save case' }));
    const saveDialog = screen.getByRole('dialog', { name: 'Save case' });
    expect(within(saveDialog).getByLabelText('Case name')).toHaveFocus();
    fireEvent.change(within(saveDialog).getByLabelText('Case name'), {
      target: { value: 'Manual preview case' },
    });
    act(() => vi.advanceTimersByTime(500));
    expect(within(saveDialog).getByLabelText('Case name')).toHaveValue('Manual preview case');
    fireEvent.click(within(saveDialog).getByRole('button', { name: 'Save case' }));

    expect(within(saveDialog).getByRole('button', { name: 'Saving...' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(600));

    const casesDialog = screen.getByRole('dialog', { name: 'Saved cases' });
    expect(within(casesDialog).getByText('Manual preview case')).toBeInTheDocument();

    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    fireEvent.click(within(casesDialog).getByText('Meera, 34 F'));
    expect(globalThis.confirm).toHaveBeenCalledWith('Load this saved case and replace the current search?');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Throbbing pain in the temples')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Source kent lectures' })).toBeInTheDocument();
  });

  it('keeps the current search when replacing it with a saved case is cancelled', () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    render(<PreviewCasesScene />);

    fireEvent.click(screen.getByRole('button', { name: 'Saved cases' }));
    const casesDialog = screen.getByRole('dialog', { name: 'Saved cases' });
    fireEvent.click(within(casesDialog).getByText('Meera, 34 F'));

    expect(globalThis.confirm).toHaveBeenCalledWith('Load this saved case and replace the current search?');
    expect(casesDialog).toBeInTheDocument();
    expect(screen.getByText('Burning pains, worse at night')).toBeInTheDocument();
    expect(screen.queryByText('Throbbing pain in the temples')).not.toBeInTheDocument();
  });

  it('keeps a saved case when deletion is cancelled', () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    render(<PreviewCasesScene />);

    fireEvent.click(screen.getByRole('button', { name: 'Saved cases' }));
    const casesDialog = screen.getByRole('dialog', { name: 'Saved cases' });
    fireEvent.click(within(casesDialog).getByRole('button', { name: 'Delete Meera, 34 F' }));

    expect(globalThis.confirm).toHaveBeenCalledWith('Delete this case?');
    expect(within(casesDialog).getByText('Meera, 34 F')).toBeInTheDocument();
  });

  it('supports the displayed search, symptom, and source controls', () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    render(<PreviewCasesScene />);

    const searchInput = screen.getByRole('textbox', { name: 'Search symptom keywords' });
    expect(searchInput).not.toHaveAttribute('readonly');
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    fireEvent.change(searchInput, { target: { value: 'burning pains' } });
    fireEvent.click(screen.getByRole('button', { name: /Burning pains, worse at night boericke/i }));
    expect(screen.getAllByText('Matches 1 of 1')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Burning pains, worse at night' }));
    expect(screen.queryByRole('button', { name: 'Remove Burning pains, worse at night' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Source boericke materia medica' }));
    const sourceDialog = screen.getByRole('dialog', { name: 'Select source' });
    fireEvent.click(within(sourceDialog).getByRole('button', { name: /Select source: A Dictionary/i }));

    expect(globalThis.confirm).toHaveBeenCalledWith('Change source and clear the current search?');
    expect(screen.getByRole('button', { name: 'Source clarke materia medica' })).toBeInTheDocument();
    expect(screen.queryByText('Restlessness after midnight')).not.toBeInTheDocument();
  });
});
