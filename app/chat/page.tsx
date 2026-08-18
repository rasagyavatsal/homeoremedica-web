import type { Metadata } from 'next';

import ChatClient from '@/components/chat-client';
import { CHAT_PAGE_DESCRIPTION } from '@/lib/seo/chat-content';

export const metadata: Metadata = {
  title: 'Chat with the materia medica',
  description: CHAT_PAGE_DESCRIPTION,
  alternates: { canonical: '/chat' },
  openGraph: {
    title: 'Chat with the materia medica — HomeoRemedica',
    description: CHAT_PAGE_DESCRIPTION,
    url: '/chat',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'HomeoRemedica — A quieter way to study the materia medica.' }],
  },
};

export default function ChatPage() {
  return <ChatClient />;
}
