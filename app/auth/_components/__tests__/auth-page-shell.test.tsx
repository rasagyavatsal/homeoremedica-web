import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthPageShell } from '../auth-page-shell';

describe('AuthPageShell', () => {
  it('renders children content within the shell', () => {
    render(
      <AuthPageShell>
        <div data-testid="child-content">Child Content</div>
      </AuthPageShell>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders brand block without eyebrow copy by default', () => {
    render(<AuthPageShell>Content</AuthPageShell>);
    expect(screen.queryByText('Account access')).not.toBeInTheDocument();
    expect(screen.getByText('HomeoRemedica')).toBeInTheDocument();
  });

  it('hides brand block when showBrand is false', () => {
    render(<AuthPageShell showBrand={false}>Content</AuthPageShell>);
    expect(screen.queryByText('Account access')).not.toBeInTheDocument();
    expect(screen.queryByText('HomeoRemedica')).not.toBeInTheDocument();
  });
});
