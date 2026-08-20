import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/services/chat-history', () => ({
  formatChatDate: () => 'Mar 4',
}));

vi.mock('@/lib/auth/firebase-auth', () => ({
  isGoogleUser: vi.fn(() => false),
  signOutUser: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
}));

import * as navigation from 'next/navigation';
import { isGoogleUser, signOutUser } from '@/lib/auth/firebase-auth';
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
    vi.mocked(isGoogleUser).mockReturnValue(false);
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

  it('deletes a chat after confirming in the modal', () => {
    const props = renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: 'Delete chat Arsenicum anxiety' }));

    expect(screen.getByRole('dialog', { name: 'Delete chat?' })).toBeInTheDocument();
    expect(
      screen.getByText(/"Arsenicum anxiety" will be permanently deleted\. This cannot be undone\./),
    ).toBeInTheDocument();

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

  it('shows the brand lockup at the top of the sidebar', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: 'HomeoRemedica home' })).toHaveAttribute('href', '/');
    expect(screen.getByText('HomeoRemedica')).toBeInTheDocument();
    const images = screen.getByText('HomeoRemedica').parentElement?.querySelectorAll('img');
    expect(images?.[0]).toHaveAttribute('src', '/logo/logo-light-transparent.png');
  });

  it('shows the signed-in account at the bottom of the sidebar', () => {
    renderSidebar({ user: { uid: 'user-1', email: 'test@example.com', displayName: 'Test User' } });

    const account = screen.getByRole('button', { name: 'Account menu' });
    expect(account).toBeInTheDocument();
    expect(account).toHaveTextContent('Test User');
    expect(account).toHaveTextContent('test@example.com');
  });

  it('offers settings and log out from the account menu', async () => {
    const push = vi.fn();
    vi.spyOn(navigation, 'useRouter').mockReturnValue({
      push,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof navigation.useRouter>);
    renderSidebar({ user: { uid: 'user-1', email: 'test@example.com', displayName: 'Test User' } });

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account menu' }), { button: 0, ctrlKey: false });

    const settings = screen.getByRole('menuitem', { name: 'Settings' });
    expect(settings).toBeInTheDocument();

    fireEvent.click(settings);
    expect(push).toHaveBeenCalledWith('/settings');

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account menu' }), { button: 0, ctrlKey: false });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Log out' }));

    await waitFor(() => expect(signOutUser).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith('/');
  });

  it('hides settings for Google-only accounts', () => {
    vi.mocked(isGoogleUser).mockReturnValue(true);
    renderSidebar({ user: { uid: 'user-1', email: 'test@example.com', displayName: 'Test User' } });

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account menu' }), { button: 0, ctrlKey: false });

    expect(screen.queryByRole('menuitem', { name: 'Settings' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
  });
});
