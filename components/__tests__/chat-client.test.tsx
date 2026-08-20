import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSendChatMessage = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api/client', () => ({
  apiClient: { sendChatMessage: mockSendChatMessage },
}));

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

const chatHistory = vi.hoisted(() => {
  let onNext: ((chats: { id: string; title: string }[]) => void) | null = null;
  return {
    subscribeToChats: vi.fn((_userId: string, next: (chats: { id: string; title: string }[]) => void) => {
      onNext = next;
      return () => {
        onNext = null;
      };
    }),
    createChat: vi.fn(),
    appendExchange: vi.fn(),
    loadChat: vi.fn(),
    deleteChat: vi.fn(),
    renameChat: vi.fn(),
    emitChats: (chats: { id: string; title: string }[]) => onNext?.(chats),
  };
});

vi.mock('@/lib/services/chat-history', () => ({
  subscribeToChats: chatHistory.subscribeToChats,
  createChat: chatHistory.createChat,
  appendExchange: chatHistory.appendExchange,
  loadChat: chatHistory.loadChat,
  deleteChat: chatHistory.deleteChat,
  renameChat: chatHistory.renameChat,
}));

vi.mock('@/components/chat-sidebar', () => ({
  ChatSidebar: ({
    chats,
    activeChatId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onRenameChat,
  }: {
    chats: { id: string; title: string }[];
    activeChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onRenameChat: (chatId: string, title: string) => void;
  }) => (
    <div data-testid="chat-sidebar">
      <button onClick={onNewChat}>sidebar-new-chat</button>
      {chats.map((chat) => (
        <div key={chat.id}>
          <button onClick={() => onSelectChat(chat.id)}>resume {chat.title}</button>
          <button onClick={() => onDeleteChat(chat.id)}>delete {chat.title}</button>
          <button onClick={() => onRenameChat(chat.id, `${chat.title} renamed`)}>
            rename {chat.title}
          </button>
        </div>
      ))}
      <span data-testid="active-chat-id">{activeChatId ?? 'none'}</span>
    </div>
  ),
}));

import ChatClient from '@/components/chat-client';
import { CHAT_SAFETY_NOTICE } from '@/lib/chat-answer';

const ANSWER_BODY = 'Nux vomica is irritable and chilly [1].';
const SIGNED_IN_AUTH = {
  user: { uid: 'user-1', email: 'test@example.com', displayName: 'Test User' },
  loading: false,
  token: null,
};

function makeResponse(overrides: Record<string, unknown> = {}) {
  return {
    answer: `${CHAT_SAFETY_NOTICE}\n\n${ANSWER_BODY}`,
    corpusVersion: '2026-08-15.v1',
    model: 'gemini-2.5-flash-lite',
    sources: [
      {
        id: '2026-08-15.v1/kent-lectures/chk_1',
        bookId: 'kent-lectures',
        bookTitle: "Kent's Lectures on Homoeopathic Materia Medica",
        author: 'James Tyler Kent',
        remedyName: 'NUX VOMICA',
        sectionTitle: 'Mind',
        passageIndexes: [0],
        text: 'Irritable.\n\nAlways chilly.',
      },
    ],
    ...overrides,
  };
}

function typeAndSend(text: string) {
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
}

describe('ChatClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, loading: false, token: null });
  });

  it('opens on an empty state with the persistent safety notice', () => {
    render(<ChatClient />);

    expect(
      screen.getByRole('heading', { name: 'Ask the materia medica' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(CHAT_SAFETY_NOTICE)).toHaveLength(1);
    // The chat column no longer carries its own New chat control; the
    // mobile hamburger toggle remains so the sidebar sheet stays reachable.
    expect(screen.queryByRole('button', { name: 'New chat' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open chat history' })).toBeInTheDocument();
  });

  it('keeps no theme toggle on the chat page without a page header', () => {
    render(<ChatClient />);

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /switch to dark mode/i })).not.toBeInTheDocument();
  });

  it('sends a message and shows the answer without the repeated notice', async () => {
    mockSendChatMessage.mockResolvedValue(makeResponse());
    render(<ChatClient />);

    typeAndSend('How is Nux vomica described?');

    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    expect(mockSendChatMessage).toHaveBeenCalledWith({
      message: 'How is Nux vomica described?',
      history: [],
    });
    expect(screen.getByText('How is Nux vomica described?')).toBeInTheDocument();
    // The composer notice stays the only visible copy of the safety text.
    expect(screen.getAllByText(CHAT_SAFETY_NOTICE)).toHaveLength(1);
  });

  it('sends prior turns as history on the next question', async () => {
    mockSendChatMessage.mockResolvedValue(makeResponse());
    render(<ChatClient />);

    typeAndSend('First question');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    typeAndSend('Tell me more');
    await waitFor(() =>
      expect(mockSendChatMessage).toHaveBeenLastCalledWith({
        message: 'Tell me more',
        history: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: ANSWER_BODY },
        ],
      }),
    );
  });

  it('reveals cited passages from the sources toggle', async () => {
    mockSendChatMessage.mockResolvedValue(makeResponse());
    render(<ChatClient />);

    typeAndSend('How is Nux vomica described?');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    expect(screen.queryByText(/Irritable\./)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /1 source/i }));

    expect(screen.getByText(/Nux Vomica · Mind/)).toBeInTheDocument();
    expect(screen.getByText('kent lectures')).toBeInTheDocument();
    expect(screen.getByText(/Irritable\./)).toBeInTheDocument();
  });

  it('collapses a long message behind a Show more toggle', async () => {
    mockSendChatMessage.mockResolvedValue(makeResponse());
    render(<ChatClient />);

    const longMessage = `Nux vomica ${'irritable '.repeat(60)}`.trim();
    typeAndSend(longMessage);
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    expect(screen.queryByText(longMessage)).not.toBeInTheDocument();
    const showMore = screen.getByRole('button', { name: 'Show more' });
    expect(showMore).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(showMore);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.queryByText(longMessage)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
  });

  it('restores the draft and shows an error when the request fails', async () => {
    mockSendChatMessage.mockRejectedValue({
      code: 'UPSTREAM_UNAVAILABLE',
      message: 'The chat service could not answer right now. Please try again.',
    });
    render(<ChatClient />);

    typeAndSend('How is Nux vomica described?');

    await waitFor(() =>
      expect(
        screen.getByText('The chat service could not answer right now. Please try again.'),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText('How is Nux vomica described?', { selector: 'p' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toHaveValue('How is Nux vomica described?');
  });

  it('clears the thread with New chat from the sidebar', async () => {
    mockSendChatMessage.mockResolvedValue(makeResponse());
    render(<ChatClient />);

    typeAndSend('How is Nux vomica described?');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'sidebar-new-chat' }));

    expect(screen.queryByText(ANSWER_BODY)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Ask the materia medica' }),
    ).toBeInTheDocument();
  });

  it('does not persist chats for signed-out users', async () => {
    mockSendChatMessage.mockResolvedValue(makeResponse());
    render(<ChatClient />);

    typeAndSend('How is Nux vomica described?');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    expect(chatHistory.subscribeToChats).not.toHaveBeenCalled();
    expect(chatHistory.createChat).not.toHaveBeenCalled();
    expect(chatHistory.appendExchange).not.toHaveBeenCalled();
  });

  it('creates a chat on the first exchange when signed in', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    mockSendChatMessage.mockResolvedValue(makeResponse());
    chatHistory.createChat.mockResolvedValue({ id: 'chat-1', title: 'How is Nux', updatedAt: null });
    render(<ChatClient />);

    expect(chatHistory.subscribeToChats).toHaveBeenCalledWith('user-1', expect.any(Function), expect.any(Function));

    typeAndSend('How is Nux vomica described?');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    expect(chatHistory.createChat).toHaveBeenCalledWith('user-1', [
      expect.objectContaining({ role: 'user', content: 'How is Nux vomica described?' }),
      expect.objectContaining({ role: 'assistant', content: ANSWER_BODY }),
    ]);
    await waitFor(() => expect(screen.getByTestId('active-chat-id')).toHaveTextContent('chat-1'));
  });

  it('appends later exchanges to the active chat', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    mockSendChatMessage.mockResolvedValue(makeResponse());
    chatHistory.createChat.mockResolvedValue({ id: 'chat-1', title: 'First question', updatedAt: null });
    render(<ChatClient />);

    typeAndSend('First question');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    typeAndSend('Tell me more');
    await waitFor(() =>
      expect(chatHistory.appendExchange).toHaveBeenCalledWith('chat-1', [
        expect.objectContaining({ role: 'user', content: 'Tell me more' }),
        expect.objectContaining({ role: 'assistant', content: ANSWER_BODY }),
      ]),
    );
  });

  it('resumes a chat from the history list', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    chatHistory.loadChat.mockResolvedValue({
      id: 'chat-9',
      userId: 'user-1',
      title: 'A past chat',
      createdAt: null,
      updatedAt: null,
      messages: [
        { id: 'm1', role: 'user', content: 'Old question' },
        { id: 'm2', role: 'assistant', content: 'Old answer' },
      ],
    });
    render(<ChatClient />);

    act(() => chatHistory.emitChats([{ id: 'chat-9', title: 'A past chat' }]));
    fireEvent.click(screen.getByRole('button', { name: 'resume A past chat' }));

    await waitFor(() => expect(chatHistory.loadChat).toHaveBeenCalledWith('chat-9'));
    expect(screen.getByText('Old question')).toBeInTheDocument();
    expect(screen.getByText('Old answer')).toBeInTheDocument();
    expect(screen.getByTestId('active-chat-id')).toHaveTextContent('chat-9');
  });

  it('shows a history error when a chat cannot be loaded', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    chatHistory.loadChat.mockRejectedValue(new Error('permission-denied'));
    render(<ChatClient />);

    act(() => chatHistory.emitChats([{ id: 'chat-9', title: 'A past chat' }]));
    fireEvent.click(screen.getByRole('button', { name: 'resume A past chat' }));

    await waitFor(() => expect(screen.getByText('permission-denied')).toBeInTheDocument());
  });

  it('deletes the active chat and clears the thread', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    mockSendChatMessage.mockResolvedValue(makeResponse());
    chatHistory.createChat.mockResolvedValue({ id: 'chat-1', title: 'How is Nux', updatedAt: null });
    chatHistory.deleteChat.mockResolvedValue(undefined);
    render(<ChatClient />);

    typeAndSend('How is Nux vomica described?');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    act(() => chatHistory.emitChats([{ id: 'chat-1', title: 'How is Nux' }]));
    fireEvent.click(screen.getByRole('button', { name: 'delete How is Nux' }));

    await waitFor(() => expect(chatHistory.deleteChat).toHaveBeenCalledWith('chat-1'));
    expect(screen.queryByText(ANSWER_BODY)).not.toBeInTheDocument();
    expect(screen.getByTestId('active-chat-id')).toHaveTextContent('none');
  });

  it('deleting another chat keeps the current thread', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    mockSendChatMessage.mockResolvedValue(makeResponse());
    chatHistory.createChat.mockResolvedValue({ id: 'chat-1', title: 'First question', updatedAt: null });
    chatHistory.deleteChat.mockResolvedValue(undefined);
    render(<ChatClient />);

    typeAndSend('First question');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    act(() =>
      chatHistory.emitChats([
        { id: 'chat-1', title: 'First question' },
        { id: 'chat-2', title: 'Older chat' },
      ]),
    );
    fireEvent.click(screen.getByRole('button', { name: 'delete Older chat' }));

    await waitFor(() => expect(chatHistory.deleteChat).toHaveBeenCalledWith('chat-2'));
    expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument();
    expect(screen.getByTestId('active-chat-id')).toHaveTextContent('chat-1');
  });

  it('renames a chat from the sidebar', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    chatHistory.renameChat.mockResolvedValue(undefined);
    render(<ChatClient />);

    act(() => chatHistory.emitChats([{ id: 'chat-1', title: 'How is Nux' }]));
    fireEvent.click(screen.getByRole('button', { name: 'rename How is Nux' }));

    await waitFor(() =>
      expect(chatHistory.renameChat).toHaveBeenCalledWith('chat-1', 'How is Nux renamed'),
    );
  });

  it('shows a history error when a chat cannot be renamed', async () => {
    mockUseAuth.mockReturnValue(SIGNED_IN_AUTH);
    chatHistory.renameChat.mockRejectedValue(new Error('permission-denied'));
    render(<ChatClient />);

    act(() => chatHistory.emitChats([{ id: 'chat-1', title: 'How is Nux' }]));
    fireEvent.click(screen.getByRole('button', { name: 'rename How is Nux' }));

    await waitFor(() =>
      expect(
        screen.getByText('That chat could not be renamed. Please try again.'),
      ).toBeInTheDocument(),
    );
  });
});
