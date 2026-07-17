import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock search store
vi.mock('@/lib/stores/search-store', () => ({
  useSearchStore: () => ({
    selectedSymptoms: [],
    results: [],
    findRemedies: vi.fn(),
    clearSymptoms: vi.fn(),
    addSymptom: vi.fn(),
    removeSymptom: vi.fn(),
    activeBook: 'boericke-MM',
    setActiveBook: vi.fn(),
  }),
}));

// Mock auth context
vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

// Mock cases store
vi.mock('@/lib/stores/cases-store', () => ({
  useCasesStore: () => ({
    cases: [],
    addCase: vi.fn(),
    selectCase: vi.fn(),
    selectedCase: null,
    deleteCase: vi.fn(),
  }),
}));

// Mock user cases hook
vi.mock('@/lib/hooks/use-user-cases', () => ({
  useUserCases: vi.fn(),
}));

// Mock Header to avoid unrelated navigation complexity
vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

// Mock UnifiedSymptomSearch to avoid complexity
vi.mock('@/components/unified-symptom-search', () => ({
  UnifiedSymptomSearch: () => <div data-testid="symptom-search">Symptom Search</div>,
}));

import FindRemedyClient from '@/components/find-remedy-client';

describe('FindRemedyClient Layout', () => {
  it('renders the main content area', () => {
    const { container } = render(<FindRemedyClient />);

    const root = container.firstElementChild as HTMLElement;
    const main = screen.getByRole('main');
    const symptomSearch = screen.getByTestId('symptom-search');

    expect(root.className).toContain('flex');
    expect(root.className).toContain('flex-col');
    expect(main.className).toContain('flex-1');
    expect(main).toBeInTheDocument();
    expect(symptomSearch).toBeInTheDocument();
    expect(main).toContainElement(symptomSearch);
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });
});
