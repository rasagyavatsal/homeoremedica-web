import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/services/chat-history', () => ({
  formatChatDate: () => 'Mar 4',
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

import { ChatSidebar } from '@/components/chat-sidebar';

const CHATS = [
  { id: 'chat-1', title: 'Nux vomica in fevers', updatedAt: null },
  { id: 'chat-2', title: 'Arsenicum anxiety', updatedAt: null },
];

function renderSidebar(
  overrides: Partial<Parameters<typeof ChatSidebar>[0]> = {},
) {
  const props = {
    user: { uid: 'user-1', email: 'test@example.com' },
    chats: CHATS,
    activeChatId: null,
    isResuming: false,
    onNewChat: vi.fn(),
    onSelectChat: vi.fn(),
    onDeleteChat: vi.fn(),
    ...overrides,
  };
  render(<ChatSidebar {...props} />);
  return props;
}

describe('ChatSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists every chat with its title and formatted date', () => {
    renderSidebar();

    expect(screen.getByRole('navigation', { name: 'Chat history' })).toBeInTheDocument();
    expect(screen.getByText('Nux vomica in fevers')).toBeInTheDocument();
    expect(screen.getByText('Arsenicum anxiety')).toBeInTheDocument();
    expect(screen.getAllByText('Mar 4')).toHaveLength(2);
  });

  it('marks the active chat', () => {
    renderSidebar({ activeChatId: 'chat-2' });

    expect(screen.getByText('Arsenicum anxiety').closest('button')).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByText('Nux vomica in fevers').closest('button')).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('starts a new chat', () => {
    const props = renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: 'New chat' }));

    expect(props.onNewChat).toHaveBeenCalled();
  });

  it('selects a chat', () => {
    const props = renderSidebar();

    fireEvent.click(screen.getByText('Nux vomica in fevers'));

    expect(props.onSelectChat).toHaveBeenCalledWith('chat-1');
  });

  it('selecting a chat also closes the surrounding sheet', () => {
    const props = renderSidebar({ onNavigate: vi.fn() });

    fireEvent.click(screen.getByText('Nux vomica in fevers'));

    expect(props.onNavigate).toHaveBeenCalled();
  });

  it('deletes a chat after inline confirmation', () => {
    const props = renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: 'Delete chat Arsenicum anxiety' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(props.onDeleteChat).toHaveBeenCalledWith('chat-2');
  });

  it('cancels a pending delete without deleting', () => {
    const props = renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: 'Delete chat Arsenicum anxiety' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onDeleteChat).not.toHaveBeenCalled();
  });

  it('shows an empty state when there are no chats', () => {
    renderSidebar({ chats: [] });

    expect(screen.getByText('No chats yet.')).toBeInTheDocument();
  });

  it('prompts signed-out users to sign in', () => {
    renderSidebar({ user: null, chats: [] });

    expect(screen.getByText('Sign in to save your chats')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/login');
  });
});
