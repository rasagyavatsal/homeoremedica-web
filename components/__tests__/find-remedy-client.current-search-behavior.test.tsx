import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import FindRemedyClient from '@/components/find-remedy-client';
import { useCasesStore } from '@/lib/stores/cases-store';
import { useSearchStore } from '@/lib/stores/search-store';
import { getSearchInput } from './search-test-helper';

const FINDER_HERO_DESCRIPTION =
  'Search plain symptom keywords to find homeopathic remedy matches from classical materia medica sources, including Boericke, Clarke, Kent, and Allen. Choose one source book, select exact symptom entries, and compare ranked remedy matches in the same workflow, with saved cases available for organized study, repertory research, and follow-up reference.';

const SOURCE_COVER_DIMENSIONS = {
  '/source-covers/allen.jpg': { width: '223', height: '275' },
  '/source-covers/boericke.jpg': { width: '301', height: '371' },
  '/source-covers/clarke.jpg': { width: '298', height: '411' },
  '/source-covers/kent.jpg': { width: '366', height: '543' },
} as const;

type MockLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | { toString(): string };
  children: ReactNode;
};

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: MockLinkProps) => (
    <a href={typeof href === 'string' ? href : href.toString()} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

const mockAuthUser = {
  current: { uid: 'user-1' } as { uid: string } | null,
};

vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockAuthUser.current,
    loading: false,
  }),
}));

vi.mock('@/lib/hooks/use-user-cases', () => ({
  useUserCases: () => ({ loading: false }),
}));

const baseSearchStatus = {
  isSearching: false,
  currentBook: undefined,
  completedBooks: [] as Array<'boericke' | 'clarke' | 'kent' | 'allen'>,
  progress: 0,
  totalBooks: 4,
};

const oldCase = {
  id: 'case-old',
  name: 'Old case',
  timestamp: new Date('2026-04-01T00:00:00Z'),
  bookId: 'boericke' as const,
  selectedSymptoms: [{ id: 'symptom-old', name: 'Old symptom' }],
  userId: 'user-1',
};

const newCase = {
  id: 'case-new',
  name: 'New case',
  timestamp: new Date('2026-04-02T00:00:00Z'),
  bookId: 'kent' as const,
  selectedSymptoms: [{ id: 'symptom-new', name: 'New symptom' }],
  userId: 'user-1',
};

function resetStores() {
  useSearchStore.setState({
    activeBook: 'boericke',
    selectedSymptoms: [],
    results: [],
    searchQuery: '',
    searchStatus: baseSearchStatus,
  });

  useCasesStore.setState({
    cases: [],
    selectedCase: null,
    loading: false,
    error: null,
  });
}

describe('FindRemedyClient current search behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAuthUser.current = { uid: 'user-1' };
    resetStores();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks for confirmation before source switch when query work exists and preserves state on cancel', async () => {
    useCasesStore.setState({
      cases: [oldCase, newCase],
      selectedCase: oldCase,
    });

    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    render(<FindRemedyClient />);

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'h' } });

    fireEvent.click(screen.getByRole('button', { name: /Source Boericke/i }));
    const sourceDialog = await screen.findByRole('dialog');
    fireEvent.click(
      within(sourceDialog).getByRole('button', {
        name: /Clarke/i,
      }),
    );

    expect(confirmSpy).toHaveBeenCalledWith('Change source and clear the current search?');
    expect(useSearchStore.getState().activeBook).toBe('boericke');
    expect(useCasesStore.getState().selectedCase?.id).toBe('case-old');
    expect(input).toHaveValue('h');
  });

  it('does not ask for confirmation when only saved-case highlight exists and clears selection on source change', async () => {
    useCasesStore.setState({
      cases: [oldCase, newCase],
      selectedCase: oldCase,
    });

    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Source Boericke/i }));
    const sourceDialog = await screen.findByRole('dialog');
    fireEvent.click(
      within(sourceDialog).getByRole('button', {
        name: /Clarke/i,
      }),
    );

    expect(confirmSpy).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(useSearchStore.getState().activeBook).toBe('clarke');
    });
    expect(useCasesStore.getState().selectedCase).toBeNull();
  });

  it('loads a saved case only after confirmation and resets the current search first', async () => {
    useSearchStore.setState({
      activeBook: 'boericke',
      selectedSymptoms: [{ id: 'legacy', name: 'Legacy symptom' }],
      results: [],
      searchStatus: baseSearchStatus,
      searchQuery: '',
    });
    useCasesStore.setState({
      cases: [oldCase, newCase],
      selectedCase: oldCase,
    });

    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    render(<FindRemedyClient />);

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'h' } });

    fireEvent.click(screen.getByRole('button', { name: /Saved cases/i }));
    const casesDialog = await screen.findByRole('dialog');
    const loadNewCaseButton = within(casesDialog).getByText('New case').closest('button');
    if (!loadNewCaseButton) {
      throw new Error('Expected to find load button for "New case"');
    }
    fireEvent.click(loadNewCaseButton);

    expect(confirmSpy).toHaveBeenCalledWith('Load this saved case and replace the current search?');

    await waitFor(() => {
      expect(useSearchStore.getState().activeBook).toBe('kent');
      expect(useSearchStore.getState().selectedSymptoms).toEqual(newCase.selectedSymptoms);
      expect(useSearchStore.getState().results).toEqual([]);
      expect(useCasesStore.getState().selectedCase?.id).toBe('case-new');
      expect(getSearchInput()).toHaveValue('');
    });
  });

  it('does not load a saved case when replacement is cancelled', async () => {
    useCasesStore.setState({
      cases: [oldCase, newCase],
      selectedCase: oldCase,
    });

    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    render(<FindRemedyClient />);

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'h' } });

    fireEvent.click(screen.getByRole('button', { name: /Saved cases/i }));
    const casesDialog = await screen.findByRole('dialog');
    const loadNewCaseButton = within(casesDialog).getByText('New case').closest('button');
    if (!loadNewCaseButton) {
      throw new Error('Expected to find load button for "New case"');
    }
    fireEvent.click(loadNewCaseButton);

    expect(confirmSpy).toHaveBeenCalledWith('Load this saved case and replace the current search?');
    expect(useSearchStore.getState().activeBook).toBe('boericke');
    expect(useCasesStore.getState().selectedCase?.id).toBe('case-old');
    expect(input).toHaveValue('h');
  });

  it('shows one unauthenticated saved-cases explanation and no symptom-set/reopen language', async () => {
    mockAuthUser.current = null;

    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Saved cases/i }));
    const casesDialog = await screen.findByRole('dialog');

    expect(
      within(casesDialog).getByText('Sign in to access saved cases.'),
    ).toBeInTheDocument();
    expect(
      within(casesDialog).getAllByText('Sign in to access saved cases.'),
    ).toHaveLength(1);
    expect(within(casesDialog).queryByText(/symptom set/i)).toBeNull();
    expect(within(casesDialog).queryByText(/reopen/i)).toBeNull();
    expect(within(casesDialog).getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('does not render a redundant header description when the user is signed in with saved cases', async () => {
    useCasesStore.setState({
      cases: [oldCase],
      selectedCase: oldCase,
    });
    mockAuthUser.current = { uid: 'user-1' };

    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Saved cases/i }));
    const casesDialog = await screen.findByRole('dialog');
    
    expect(within(casesDialog).queryByText(/available\./i)).toBeNull();
    expect(within(casesDialog).queryByText(/No saved cases yet/i)).toBeNull();
  });

  it('does not render a redundant header description when the user is signed in with no saved cases', async () => {
    useCasesStore.setState({
      cases: [],
      selectedCase: null,
    });
    mockAuthUser.current = { uid: 'user-1' };

    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Saved cases/i }));
    const casesDialog = await screen.findByRole('dialog');
    
    expect(within(casesDialog).queryByText(/available\./i)).toBeNull();
    expect(within(casesDialog).getByText(/No saved cases yet/i)).toBeInTheDocument();
  });

  it('renders Save case dialog without helper copy', async () => {
    useSearchStore.setState({
      selectedSymptoms: [{ id: 'symptom-1', name: 'Burning pain' }],
      results: [],
      searchQuery: '',
    });

    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Save case/i }));
    const saveDialog = await screen.findByRole('dialog');

    expect(within(saveDialog).queryByText(/Give this saved case a name so you can load it later/i)).toBeNull();
    expect(within(saveDialog).queryByText(/Use a concise label you will recognise later/i)).toBeNull();
  });

  it('keeps landing and editorial copy out of the focused finder in every search state', async () => {
    render(<FindRemedyClient />);

    expect(screen.queryByRole('heading', { name: 'Homeopathic remedy finder' })).toBeNull();
    expect(screen.queryByText(FINDER_HERO_DESCRIPTION)).toBeNull();
    expect(screen.queryByRole('region', { name: 'Find remedy features' })).toBeNull();

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'h' } });

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 1, name: 'Homeopathic remedy finder' }),
      ).toBeNull();
    });
    expect(
      screen.queryByText(FINDER_HERO_DESCRIPTION),
    ).toBeNull();
  });

  it('shows short labels, short descriptors, and responsive source grid without source search UI', async () => {
    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Source Boericke/i }));
    const sourceDialog = await screen.findByRole('dialog');

    expect(within(sourceDialog).queryByLabelText(/Search source/i)).toBeNull();
    expect(within(sourceDialog).queryByText(/No sources match this search/i)).toBeNull();
    expect(
      within(sourceDialog).queryByText(/Concise clinical materia medica with practical bedside indications./i),
    ).toBeNull();

    const expectedSourceLabels = ['Boericke', 'Clarke', 'Kent', 'Allen'];
    expectedSourceLabels.forEach((label) => {
      expect(within(sourceDialog).getByText(label)).toBeInTheDocument();
    });


    const boerickeCard = within(sourceDialog).getByRole('button', {
      name: /Select source: Boericke's Materia Medica/i,
    });
    const sourceGrid = boerickeCard.parentElement;
    if (!sourceGrid) {
      throw new Error('Expected source card to be inside a grid container');
    }
    expect(sourceGrid).toHaveClass('grid-cols-2');
    expect(sourceGrid).toHaveClass('overflow-y-auto');
    expect(sourceDialog).toHaveClass('max-h-viewport-dialog');

    const sourceCoverImages = Array.from(sourceDialog.querySelectorAll('img')).filter((image) =>
      image.getAttribute('src')?.startsWith('/source-covers/'),
    );
    expect(sourceCoverImages).toHaveLength(4);
    sourceCoverImages.forEach((image) => {
      const src = image.getAttribute('src') as keyof typeof SOURCE_COVER_DIMENSIONS | null;
      if (!src || !(src in SOURCE_COVER_DIMENSIONS)) {
        throw new Error(`Unexpected source cover path: ${src ?? 'none'}`);
      }

      expect(image).toHaveAttribute('width', SOURCE_COVER_DIMENSIONS[src].width);
      expect(image).toHaveAttribute('height', SOURCE_COVER_DIMENSIONS[src].height);
      expect(image).toHaveClass('h-auto', 'w-full');
      expect(image.closest('[aria-hidden="true"]')).not.toHaveClass('aspect-[4/5]');
    });
  });

  it('marks selected source with active styling classes and pressed state', async () => {
    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Source Boericke/i }));
    const sourceDialog = await screen.findByRole('dialog');

    const selectedCard = within(sourceDialog).getByRole('button', {
      name: /Select source: Boericke's Materia Medica/i,
    });
    expect(selectedCard).toHaveAttribute('aria-pressed', 'true');
    expect(selectedCard).toHaveClass('border-primary');
    expect(selectedCard).toHaveClass('bg-accent');
  });

  it('removes the top-level clear button and keeps clear all in selected symptoms panel without supporting copy', () => {
    useSearchStore.setState({
      selectedSymptoms: [{ id: 'symptom-1', name: 'Burning pain' }],
      results: [],
      searchQuery: '',
    });

    render(<FindRemedyClient />);

    expect(screen.queryByRole('button', { name: /Clear symptoms/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Clear all/i })).toBeInTheDocument();
    expect(screen.queryByText(/1 symptom selected for this search\./)).toBeNull();
  });

  it('renders matching remedies card without supporting copy', () => {
    useSearchStore.setState({
      selectedSymptoms: [{ id: 'symptom-1', name: 'Burning pain' }],
      results: [
        {
          remedy: { id: 'rem-1', name: 'Arnica' },
          score: 1,
          matchedSymptoms: ['Burning pain'],
        },
      ],
      searchQuery: '',
      activeBook: 'boericke',
    });

    render(<FindRemedyClient />);
    expect(screen.getByText('Matching remedies')).toBeInTheDocument();
    expect(screen.queryByText(/Ranked by symptom overlap in/)).toBeNull();
  });

  it('renders source dialog without redundant helper copy', async () => {
    render(<FindRemedyClient />);

    fireEvent.click(screen.getByRole('button', { name: /Source Boericke/i }));
    const sourceDialog = await screen.findByRole('dialog');

    expect(within(sourceDialog).queryByText(/Choose one classical source for this search\./i)).toBeNull();
  });

  it('renders Save case and Clear all buttons with responsive layout to prevent misalignment on small screens', () => {
    useSearchStore.setState({
      selectedSymptoms: [{ id: 'symptom-1', name: 'Burning pain' }],
      results: [],
      searchQuery: '',
    });

    render(<FindRemedyClient />);

    // Assert the CardHeader for the selected symptoms panel has the responsive classes for mobile and desktop layout
    const header = screen.getByText('Selected symptoms').closest('.flex');
    expect(header).toHaveClass('flex-col', 'sm:flex-row');
  });
});
