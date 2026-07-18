import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PreviewRemedyScene } from '@/components/preview-remedy-scene';

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header" />,
}));

describe('PreviewRemedyScene', () => {
  it('omits global navigation from the embedded preview', () => {
    render(<PreviewRemedyScene />);

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });
});
