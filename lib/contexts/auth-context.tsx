"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FirebaseUser } from '@/lib/auth/firebase-auth';
import { useAuthStore } from '@/lib/stores/auth-store';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null
});

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const initializeAuthListener = useAuthStore(state => state.initializeAuthListener);
  const storeUser = useAuthStore(state => state.user);
  const initialized = useAuthStore(state => state.initialized);
  
  // We'll keep these for local context consumers if they exist,
  // but they will be synced from the store.
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, [initializeAuthListener]);

  useEffect(() => {
    if (initialized) {
      if (storeUser) {
        setUser({
          uid: storeUser.id,
          email: storeUser.email,
          displayName: storeUser.name
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [storeUser, initialized]);

  const value = useMemo(() => ({ 
      user, 
      loading, 
      token: null // Token management is now internal to store/apiClient
    }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
