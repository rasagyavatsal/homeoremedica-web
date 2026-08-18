import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ChatPage from './page';

vi.mock('@/components/chat-client', () => ({
  default: () => <main><div data-testid="chat-workspace" /></main>,
}));

describe('ChatPage', () => {
  it('contains the chat workspace without landing-page copy', () => {
    render(<ChatPage />);

    expect(screen.getByTestId('chat-workspace')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'A quieter way to study the materia medica.' }),
    ).not.toBeInTheDocument();
  });
});
