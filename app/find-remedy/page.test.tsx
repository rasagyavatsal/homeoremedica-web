import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FindRemedyPage from './page';

vi.mock('@/components/find-remedy-client', () => ({
  default: () => <main><div data-testid="symptom-search" /></main>,
}));

describe('FindRemedyPage', () => {
  it('contains the focused search workspace without landing-page copy', () => {
    render(<FindRemedyPage />);

    expect(screen.getByTestId('symptom-search')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'A quieter way to find the remedy.' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Find remedy features' })).not.toBeInTheDocument();
  });
});
