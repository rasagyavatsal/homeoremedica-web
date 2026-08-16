import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSendChatMessage = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api/client', () => ({
  apiClient: { sendChatMessage: mockSendChatMessage },
}));

vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header" />,
}));

import ChatClient from '@/components/chat-client';
import { CHAT_SAFETY_NOTICE } from '@/lib/chat-answer';

const ANSWER_BODY = 'Nux vomica is irritable and chilly [1].';

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
  });

  it('opens on an empty state with the persistent safety notice', () => {
    render(<ChatClient />);

    expect(
      screen.getByRole('heading', { name: 'Ask the materia medica' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(CHAT_SAFETY_NOTICE)).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'New chat' })).not.toBeInTheDocument();
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

  it('clears the thread with New chat', async () => {
    mockSendChatMessage.mockResolvedValue(makeResponse());
    render(<ChatClient />);

    typeAndSend('How is Nux vomica described?');
    await waitFor(() => expect(screen.getByText(ANSWER_BODY)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'New chat' }));

    expect(screen.queryByText(ANSWER_BODY)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Ask the materia medica' }),
    ).toBeInTheDocument();
  });
});
