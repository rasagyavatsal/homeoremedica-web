import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders breadcrumbs with correct links and active state', () => {
    const items = [
      { label: 'Category', href: '/category' },
      { label: 'Current Page' }
    ];
    render(<Breadcrumbs items={items} />);

    // Home link
    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveAttribute('href', '/');
    
    // Category link
    const categoryLink = screen.getByText('Category');
    expect(categoryLink).toHaveAttribute('href', '/category');
    
    // Current page (not a link)
    const currentPage = screen.getByText('Current Page');
    expect(currentPage).not.toHaveAttribute('href');
  });
});
