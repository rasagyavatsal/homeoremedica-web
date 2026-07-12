"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useAuthRedirect() {
  const { user } = useAuth();
  const { loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    router.replace('/');
  }, [loading, user, router]);
}
