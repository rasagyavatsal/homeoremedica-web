import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PillLink } from '../interactive';

describe('Semantic Interactive Primitives', () => {
  describe('PillLink', () => {
    it('renders as a link with active semantics when active', () => {
      render(
        <PillLink href="/active" active>
          Active Pill
        </PillLink>
      );
      
      const link = screen.getByRole('link', { name: 'Active Pill' });
      expect(link).toHaveAttribute('href', '/active');
      expect(link).toHaveAttribute('aria-current', 'page');
      // Should have active visual styling (implementation detail, but verifiable via class)
      expect(link.className).toContain('bg-primary');
    });

    it('renders as a link with inactive semantics when not active', () => {
      render(
        <PillLink href="/inactive">
          Inactive Pill
        </PillLink>
      );
      
      const link = screen.getByRole('link', { name: 'Inactive Pill' });
      expect(link).toHaveAttribute('href', '/inactive');
      expect(link).not.toHaveAttribute('aria-current');
      expect(link.className).not.toContain('bg-primary');
    });
  });
});
