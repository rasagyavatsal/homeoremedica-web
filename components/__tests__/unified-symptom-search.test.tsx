import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { UnifiedSymptomSearch } from '../unified-symptom-search';
import { getSearchInput, typeSearchQuery } from './search-test-helper';

// Mock search store
const mockSetActiveBook = vi.fn();
const mockActiveBook = { current: 'boericke' as 'boericke' | 'clarke' | 'kent' };

vi.mock('@/lib/stores/search-store', () => ({
  useSearchStore: (selector?: any) => {
    const state = {
      activeBook: mockActiveBook.current,
      setActiveBook: mockSetActiveBook,
    };
    return selector ? selector(state) : state;
  },
}));

// Mock apiClient
const mockSearchSymptoms = vi.fn();
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    searchSymptoms: (...args: any[]) => mockSearchSymptoms(...args),
  },
}));

// Mock lucide-react to avoid SVG rendering issues in jsdom
vi.mock('lucide-react', () => ({
  Loader2: (props: any) => <span data-testid="loader" {...props} />,
  Search: (props: any) => <span data-testid="search-icon" {...props} />,
  BookOpen: (props: any) => <span data-testid="book-icon" {...props} />,
  Check: (props: any) => <span data-testid="check-icon" {...props} />,
  Plus: (props: any) => <span data-testid="plus-icon" {...props} />,
  X: (props: any) => <span data-testid="x-icon" {...props} />,
  ChevronDown: (props: any) => <span data-testid="chevron-down" {...props} />,
  ChevronUp: (props: any) => <span data-testid="chevron-up" {...props} />,
  FileText: (props: any) => <span data-testid="file-text-icon" {...props} />,
}));

describe('UnifiedSymptomSearch', () => {
  const mockOnSymptomSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockActiveBook.current = 'boericke';
    mockSearchSymptoms.mockResolvedValue({ results: [], total: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input with placeholder', () => {
    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    expect(getSearchInput()).toBeInTheDocument();
  });

  it('renders a compact search control', () => {
    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    const input = getSearchInput();
    expect(input).toHaveClass('h-control');
    expect(input).not.toHaveClass('h-control-lg');
    expect(input.parentElement).toHaveClass('py-2');
  });

  it('opens the shared blurred backdrop and dismisses it with an icon-only close button', async () => {
    mockSearchSymptoms.mockResolvedValue({
      results: [{ name: 'Headache frontal', books: ['boericke'], matchType: 'partial' }],
      total: 1,
    });

    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    const input = getSearchInput();
    fireEvent.focus(input);

    const backdrop = document.querySelector<HTMLElement>('[data-slot="search-backdrop"]');
    expect(backdrop).toHaveClass(
      'bg-scrim/70',
      'backdrop-blur-sm',
      'search-overlay-backdrop',
    );

    await typeSearchQuery('headache');

    const closeButton = await screen.findByRole('button', { name: 'Close search' });
    expect(closeButton).toHaveTextContent('');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Headache frontal')).not.toBeInTheDocument();
    expect(document.querySelector('[data-slot="search-backdrop"]')).toBeNull();
    expect(input).toHaveValue('headache');
  });

  it('renders books button with active book', () => {
    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    // The books button should show the current book value
    expect(screen.getByText('Boericke')).toBeInTheDocument();
  });

  it('calls onOpenBooks when Books button is clicked', () => {
    const mockOnOpenBooks = vi.fn();
    render(
      <UnifiedSymptomSearch 
        onSymptomSelect={mockOnSymptomSelect} 
        onOpenBooks={mockOnOpenBooks} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Source Boericke/i }));
    expect(mockOnOpenBooks).toHaveBeenCalled();
  });

  it('typing triggers debounced API call', async () => {
    mockSearchSymptoms.mockResolvedValue({
      results: [{ name: 'Headache', books: ['boericke'], matchType: 'partial' }],
      total: 1,
    });

    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    await typeSearchQuery('head', 0);

    // Should NOT have called API immediately
    expect(mockSearchSymptoms).not.toHaveBeenCalled();

    // Advance past debounce (300ms)
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockSearchSymptoms).toHaveBeenCalledWith('head', 'boericke', 50, 0);
    });
  });

  it('does not call API for queries shorter than 2 chars', async () => {
    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    await typeSearchQuery('h');

    expect(mockSearchSymptoms).not.toHaveBeenCalled();
  });

  it('results dropdown shows after 2+ chars typed and results returned', async () => {
    mockSearchSymptoms.mockResolvedValue({
      results: [
        { name: 'Headache frontal', books: ['boericke'], matchType: 'partial' },
        { name: 'Headache vertex', books: ['boericke'], matchType: 'partial' },
      ],
      total: 2,
    });

    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    await typeSearchQuery('headache');

    await waitFor(() => {
      expect(screen.getByText('Headache frontal')).toBeInTheDocument();
      expect(screen.getByText('Headache vertex')).toBeInTheDocument();
    });
  });

  it('clicking a symptom calls onSymptomSelect', async () => {
    mockSearchSymptoms.mockResolvedValue({
      results: [
        { name: 'Headache frontal', books: ['boericke'], matchType: 'partial' },
      ],
      total: 1,
    });

    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    await typeSearchQuery('headache');

    await waitFor(() => {
      expect(screen.getByText('Headache frontal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Headache frontal'));
    expect(mockOnSymptomSelect).toHaveBeenCalledWith('Headache frontal');
  });

  it('selected symptoms show check mark', async () => {
    mockSearchSymptoms.mockResolvedValue({
      results: [
        { name: 'Headache frontal', books: ['boericke'], matchType: 'partial' },
      ],
      total: 1,
    });

    render(
      <UnifiedSymptomSearch
        onSymptomSelect={mockOnSymptomSelect}
        selectedSymptoms={[{ id: 's1', name: 'Headache frontal' }]}
      />
    );

    await typeSearchQuery('headache');

    await waitFor(() => {
      expect(screen.getByText('Headache frontal')).toBeInTheDocument();
    });

    // Check icon should be present for the selected symptom
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('Escape dismisses dropdown', async () => {
    mockSearchSymptoms.mockResolvedValue({
      results: [
        { name: 'Headache', books: ['boericke'], matchType: 'partial' },
      ],
      total: 1,
    });

    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    const input = await typeSearchQuery('headache');

    await waitFor(() => {
      expect(screen.getByText('Headache')).toBeInTheDocument();
    });

    // Press Escape
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Escape' });
    });

    await waitFor(() => {
      expect(screen.queryByText('Headache')).not.toBeInTheDocument();
    });
    expect(document.querySelector('[data-slot="search-backdrop"]')).toBeNull();
  });

  it('"No symptoms found" message for empty results', async () => {
    mockSearchSymptoms.mockResolvedValue({ results: [], total: 0 });

    render(
      <UnifiedSymptomSearch onSymptomSelect={mockOnSymptomSelect} />
    );

    fireEvent.focus(getSearchInput());
    await typeSearchQuery('xyznonexistent');

    await waitFor(() => {
      expect(screen.getByText(/No symptoms found/)).toBeInTheDocument();
    });

    const emptyMessage = screen.getByText(/No symptoms found/);
    expect(emptyMessage.closest('.search-overlay-surface')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Close search' }));
    expect(screen.queryByText(/No symptoms found/)).not.toBeInTheDocument();
  });

  it('calls onOpenCases when Saved Cases button is clicked', () => {
    const mockOnOpenCases = vi.fn();
    render(
      <UnifiedSymptomSearch 
        onSymptomSelect={mockOnSymptomSelect} 
        onOpenCases={mockOnOpenCases} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Saved cases/i }));
    expect(mockOnOpenCases).toHaveBeenCalled();
  });

  it('does not render duplicate active workspace metadata row', () => {
    render(
      <UnifiedSymptomSearch
        onSymptomSelect={mockOnSymptomSelect}
        selectedSymptoms={[{ id: 's1', name: 'Headache frontal' }]}
        onOpenCases={vi.fn()}
      />
    );

    expect(screen.queryByText(/^Source:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Selected:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Cases$/i })).not.toBeInTheDocument();
  });

  it('clears query when resetSignal changes', async () => {
    const mockOnSearchActive = vi.fn();
    const { rerender } = render(
      <UnifiedSymptomSearch
        onSymptomSelect={mockOnSymptomSelect}
        onSearchActive={mockOnSearchActive}
      />
    );

    const input = await typeSearchQuery('head', 0);

    expect(input).toHaveValue('head');

    rerender(
      <UnifiedSymptomSearch
        onSymptomSelect={mockOnSymptomSelect}
        onSearchActive={mockOnSearchActive}
        resetSignal={1}
      />
    );

    await waitFor(() => {
      expect(getSearchInput()).toHaveValue('');
    });
    expect(mockOnSearchActive).toHaveBeenCalledWith(false);
  });

  it('calls onSearchActive when typing starts and stops', async () => {
    const mockOnSearchActive = vi.fn();
    render(
      <UnifiedSymptomSearch 
        onSymptomSelect={mockOnSymptomSelect} 
        onSearchActive={mockOnSearchActive} 
      />
    );

    // Start typing
    await typeSearchQuery('h', 0);
    expect(mockOnSearchActive).toHaveBeenCalledWith(true);

    // Clear typing
    await typeSearchQuery('', 0);
    expect(mockOnSearchActive).toHaveBeenCalledWith(false);
  });
});
