import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { User } from '@/types';

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName?: string;
}

export interface AuthAdapter {
  signInWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOutUser: () => Promise<void>;
  getCurrentUserToken: () => Promise<string | null>;
  onIdTokenChange: (callback: (token: string | null, user: FirebaseUser | null) => void) => () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export interface AuthApiClient {
  setAuthToken: (token: string | null) => void;
  getSession: (name?: string) => Promise<any>;
}

export interface AuthStoreConfig {
  apiClient: AuthApiClient;
  authAdapter: AuthAdapter;
  storage: StateStorage;
  onLogout?: () => void;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuthListener: () => () => void;
}

export function createAuthStore(config: AuthStoreConfig) {
  const { apiClient, authAdapter, storage, onLogout } = config;
  let interactiveAuthPending = false;

  return create<AuthState>()(
    persist(
      (set, get) => {
        const toUser = (firebaseUser: FirebaseUser, name?: string): User => ({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: name || firebaseUser.displayName || '',
        });

        const createBackendError = () => {
          const error = new Error('Failed to connect to backend. Please check your connection.');
          (error as Error & { code: string }).code = 'backend/connection-failed';
          return error;
        };

        const rollbackAuthentication = async () => {
          apiClient.setAuthToken(null);
          set({ user: null });
          await Promise.resolve(authAdapter.signOutUser()).catch((error) => {
            console.error('Failed to roll back Firebase authentication:', error);
          });
        };

        const establishBackendSession = async (firebaseUser: FirebaseUser, name?: string) => {
          try {
            const token = await authAdapter.getCurrentUserToken();
            if (!token) {
              throw createBackendError();
            }

            apiClient.setAuthToken(token);
            await apiClient.getSession(name);
            return toUser(firebaseUser, name);
          } catch (error) {
            console.error('Failed to establish backend session:', error);
            await rollbackAuthentication();
            throw createBackendError();
          }
        };

        return {
        user: null,
        loading: false,
        initialized: false,
        
        signIn: async (email: string, password: string) => {
          set({ loading: true });
          interactiveAuthPending = true;
          try {
            const firebaseUser = await authAdapter.signInWithEmail(email, password);
            const user = await establishBackendSession(firebaseUser);
            set({ user, loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          } finally {
            interactiveAuthPending = false;
          }
        },
        
        signUp: async (email: string, password: string, name?: string) => {
          set({ loading: true });
          interactiveAuthPending = true;
          try {
            const firebaseUser = await authAdapter.signUpWithEmail(email, password, name);
            const user = await establishBackendSession(firebaseUser, name);
            set({ user, loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          } finally {
            interactiveAuthPending = false;
          }
        },

        signInWithGoogle: async () => {
          set({ loading: true });
          interactiveAuthPending = true;
          try {
            const firebaseUser = await authAdapter.signInWithGoogle();
            const user = await establishBackendSession(firebaseUser, firebaseUser.displayName);
            set({ user, loading: false });
          } catch (error: any) {
            set({ loading: false });
            console.error('signInWithGoogle error in store:', error);
            if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
              throw createBackendError();
            }
            throw error;
          } finally {
            interactiveAuthPending = false;
          }
        },
        
        logout: async () => {
          await authAdapter.signOutUser();
          apiClient.setAuthToken(null);
          set({ user: null });
          if (onLogout) {
            onLogout();
          }
        },

        changePassword: async (currentPassword, newPassword) => {
          await authAdapter.changePassword(currentPassword, newPassword);
        },
        
        setUser: (user) => set({ user }),

        initializeAuthListener: () => {
          return authAdapter.onIdTokenChange((token, firebaseUser) => {
            apiClient.setAuthToken(token);
            if (firebaseUser) {
              if (interactiveAuthPending) {
                set({ initialized: true });
                return;
              }

              const currentName = get().user?.name || firebaseUser.displayName;
              set({ user: null });
              void apiClient.getSession(currentName).then(() => {
                set({ user: toUser(firebaseUser, currentName), initialized: true });
              }).catch(async (error) => {
                console.error('Failed to restore backend session:', error);
                await rollbackAuthentication();
                set({ initialized: true });
              });
            } else {
              set({ user: null, initialized: true });
            }
          });
        }
      }},
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => storage),
        partialize: (state) => ({ user: state.user })
      }
    )
  );
}
