import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  arrayUnion: vi.fn((...values: unknown[]) => ({ __arrayUnion: values })),
  serverTimestamp: vi.fn(() => ({ __serverTimestamp: true })),
  Timestamp: class {
    constructor(public seconds: number, public nanoseconds: number) {}
    toDate() {
      return new Date(this.seconds * 1000 + this.nanoseconds / 1_000_000);
    }
  },
}));

vi.mock('firebase/firestore', () => firestoreMocks);

vi.mock('@/lib/firebase', () => ({ db: { __mockDb: true } }));

import {
  appendExchange,
  CHAT_TITLE_MAX_LENGTH,
  createChat,
  deleteChat,
  formatChatDate,
  loadChat,
  renameChat,
  subscribeToChats,
  titleFromMessage,
} from '@/lib/services/chat-history';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('titleFromMessage', () => {
  it('uses the first line as the title', () => {
    expect(titleFromMessage('Nux vomica in fevers\nWith chills')).toBe('Nux vomica in fevers');
  });

  it('trims surrounding whitespace', () => {
    expect(titleFromMessage('  A short question  ')).toBe('A short question');
  });

  it(`clips long titles to ${CHAT_TITLE_MAX_LENGTH} characters`, () => {
    const title = titleFromMessage('x'.repeat(200));
    expect(title).toHaveLength(CHAT_TITLE_MAX_LENGTH);
    expect(title.endsWith('…')).toBe(true);
  });

  it('falls back to "New chat" for empty content', () => {
    expect(titleFromMessage('')).toBe('New chat');
    expect(titleFromMessage('\n\n')).toBe('New chat');
  });
});

describe('formatChatDate', () => {
  const now = new Date(2026, 2, 4, 20, 15); // Mar 4, 2026, 8:15 PM

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function timestampAt(date: Date) {
    return new firestoreMocks.Timestamp(date.getTime() / 1000, 0) as never;
  }

  it('shows a time for today', () => {
    expect(formatChatDate(timestampAt(new Date(2026, 2, 4, 9, 5)))).toBe('9:05 AM');
  });

  it('shows "Yesterday" for the previous day', () => {
    expect(formatChatDate(timestampAt(new Date(2026, 2, 3, 23, 59)))).toBe('Yesterday');
  });

  it('shows a short date within the same year', () => {
    expect(formatChatDate(timestampAt(new Date(2026, 1, 12, 12, 0)))).toBe('Feb 12');
  });

  it('shows the year for older dates', () => {
    expect(formatChatDate(timestampAt(new Date(2025, 11, 31, 12, 0)))).toContain('2025');
  });

  it('returns an empty string without a timestamp', () => {
    expect(formatChatDate(null)).toBe('');
  });
});

describe('createChat', () => {
  it('writes the user id, derived title, timestamps, and messages', async () => {
    firestoreMocks.addDoc.mockResolvedValue({ id: 'chat-1' });

    const summary = await createChat('user-1', [
      { id: 'm1', role: 'user', content: 'Tell me about Nux vomica' },
      { id: 'm2', role: 'assistant', content: 'It is irritable and chilly.' },
    ]);

    expect(firestoreMocks.collection).toHaveBeenCalledWith({ __mockDb: true }, 'chats');
    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(undefined, {
      userId: 'user-1',
      title: 'Tell me about Nux vomica',
      createdAt: { __serverTimestamp: true },
      updatedAt: { __serverTimestamp: true },
      messages: [
        { id: 'm1', role: 'user', content: 'Tell me about Nux vomica' },
        { id: 'm2', role: 'assistant', content: 'It is irritable and chilly.' },
      ],
    });
    expect(summary).toEqual({ id: 'chat-1', title: 'Tell me about Nux vomica', updatedAt: null });
  });

  it('falls back to "New chat" without a user message', async () => {
    firestoreMocks.addDoc.mockResolvedValue({ id: 'chat-1' });

    await createChat('user-1', []);

    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({ title: 'New chat' }));
  });
});

describe('appendExchange', () => {
  it('appends the exchange and refreshes updatedAt', async () => {
    firestoreMocks.doc.mockReturnValue({ __docRef: 'chats/chat-1' });
    firestoreMocks.updateDoc.mockResolvedValue(undefined);

    await appendExchange('chat-1', [
      { id: 'm3', role: 'user', content: 'Tell me more' },
      { id: 'm4', role: 'assistant', content: 'It is chilly.' },
    ]);

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ __mockDb: true }, 'chats', 'chat-1');
    expect(firestoreMocks.arrayUnion).toHaveBeenCalledWith(
      { id: 'm3', role: 'user', content: 'Tell me more' },
      { id: 'm4', role: 'assistant', content: 'It is chilly.' },
    );
    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { __docRef: 'chats/chat-1' },
      {
        messages: { __arrayUnion: [{ id: 'm3', role: 'user', content: 'Tell me more' }, { id: 'm4', role: 'assistant', content: 'It is chilly.' }] },
        updatedAt: { __serverTimestamp: true },
      },
    );
  });
});

describe('loadChat', () => {
  it('returns the chat record when it exists', async () => {
    const timestamp = new firestoreMocks.Timestamp(1_000, 0);
    firestoreMocks.doc.mockReturnValue({ __docRef: 'chats/chat-1' });
    firestoreMocks.getDoc.mockResolvedValue({
      id: 'chat-1',
      exists: () => true,
      data: () => ({
        userId: 'user-1',
        title: 'Nux vomica',
        createdAt: timestamp,
        updatedAt: timestamp,
        messages: [{ id: 'm1', role: 'user', content: 'Hello' }],
      }),
    });

    const chat = await loadChat('chat-1');

    expect(chat).toEqual({
      id: 'chat-1',
      userId: 'user-1',
      title: 'Nux vomica',
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [{ id: 'm1', role: 'user', content: 'Hello' }],
    });
  });

  it('returns null for a missing chat', async () => {
    firestoreMocks.doc.mockReturnValue({ __docRef: 'chats/missing' });
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false });

    expect(await loadChat('missing')).toBeNull();
  });
});

describe('renameChat', () => {
  it('updates the chat title', async () => {
    firestoreMocks.doc.mockReturnValue({ __docRef: 'chats/chat-1' });
    firestoreMocks.updateDoc.mockResolvedValue(undefined);

    await renameChat('chat-1', 'Renamed title');

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ __mockDb: true }, 'chats', 'chat-1');
    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { __docRef: 'chats/chat-1' },
      { title: 'Renamed title' },
    );
  });
});

describe('deleteChat', () => {
  it('deletes the chat document', async () => {
    firestoreMocks.doc.mockReturnValue({ __docRef: 'chats/chat-1' });
    firestoreMocks.deleteDoc.mockResolvedValue(undefined);

    await deleteChat('chat-1');

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ __mockDb: true }, 'chats', 'chat-1');
    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith({ __docRef: 'chats/chat-1' });
  });
});

describe('subscribeToChats', () => {
  beforeEach(() => {
    firestoreMocks.collection.mockReturnValue({ __collectionRef: 'chats' });
    firestoreMocks.where.mockReturnValue({ __query: 'where' });
    firestoreMocks.orderBy.mockReturnValue({ __query: 'orderBy' });
  });

  it('queries newest-first for the user and maps snapshots to summaries', () => {
    const onNext = vi.fn();
    firestoreMocks.onSnapshot.mockReturnValue(() => {});

    subscribeToChats('user-1', onNext, vi.fn());

    expect(firestoreMocks.collection).toHaveBeenCalledWith({ __mockDb: true }, 'chats');
    expect(firestoreMocks.where).toHaveBeenCalledWith('userId', '==', 'user-1');
    expect(firestoreMocks.orderBy).toHaveBeenCalledWith('updatedAt', 'desc');
    expect(firestoreMocks.query).toHaveBeenCalledWith(
      { __collectionRef: 'chats' },
      { __query: 'where' },
      { __query: 'orderBy' },
    );

    const handleSnapshot = firestoreMocks.onSnapshot.mock.calls[0]![1];
    handleSnapshot(
      {
        docs: [
          { id: 'chat-2', data: () => ({ title: 'Second', updatedAt: null }) },
          { id: 'chat-1', data: () => ({ title: 'First' }) },
        ],
      },
      null,
    );

    expect(onNext).toHaveBeenCalledWith([
      { id: 'chat-2', title: 'Second', updatedAt: null },
      { id: 'chat-1', title: 'First', updatedAt: null },
    ]);
  });

  it('reports subscription failures through onError', () => {
    const onNext = vi.fn();
    const onError = vi.fn();
    firestoreMocks.onSnapshot.mockReturnValue(() => {});

    subscribeToChats('user-1', onNext, onError);

    const handleError = firestoreMocks.onSnapshot.mock.calls[0]![2];
    handleError(new Error('permission-denied'));

    expect(onNext).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(new Error('permission-denied'));
  });

  it('returns the unsubscribe function', () => {
    const unsubscribe = vi.fn();
    firestoreMocks.onSnapshot.mockReturnValue(unsubscribe);

    expect(subscribeToChats('user-1', vi.fn())).toBe(unsubscribe);
  });
});
