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

  it('omits global navigation from the embedded preview', () => {
    render(<PreviewCasesScene />);

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'Source clarke materia medica' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3_000));
    const reopenedCases = screen.getByRole('dialog', { name: 'Saved cases' });
    expect(
      within(reopenedCases).getByRole('button', { name: /^Dry cough follow-up/ }).parentElement,
    ).toHaveClass('bg-accent');
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

    for (const _character of 'Night-time burning pain') {
      act(() => vi.advanceTimersByTime(45));
    }
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole('dialog', { name: 'Saved cases' })).toBeInTheDocument();
    expect(document.activeElement).toBe(outsidePreview);

    act(() => vi.advanceTimersByTime(2_000));
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

    const casesDialog = screen.getByRole('dialog', { name: 'Saved cases' });
    expect(within(casesDialog).getByText('Manual preview case')).toBeInTheDocument();

    fireEvent.click(within(casesDialog).getByText('Sunlight headache'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Throbbing pain in the temples')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Source kent lectures' })).toBeInTheDocument();
  });
});
