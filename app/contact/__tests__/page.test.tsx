import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ContactClient } from '../contact-client';

describe('ContactClient', () => {
  it('renders contact title as the page heading without an eyebrow label', () => {
    render(<ContactClient />);

    const title = screen.getByRole('heading', { level: 1, name: 'Contact' });
    expect(title).toBeInTheDocument();
    expect(screen.queryByText('Utility contact')).not.toBeInTheDocument();
    expect(screen.queryByText(/Have a product question or need support/i)).toBeNull();
  });
});
