import { createAuthStore, AuthAdapter } from '@homeoremedica/shared';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  signInWithGoogle, 
  getCurrentUserToken,
  onIdTokenChange,
  changePassword as firebaseChangePassword
} from '@/lib/auth/firebase-auth';
import { apiClient } from '@/lib/api/client';

const webAuthAdapter: AuthAdapter = {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
  getCurrentUserToken,
  onIdTokenChange,
  changePassword: firebaseChangePassword,
};

const webStorage = {
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useAuthStore = createAuthStore({
  apiClient,
  authAdapter: webAuthAdapter,
  storage: webStorage,
  onLogout: () => {
    localStorage.removeItem('auth-storage');
  },
});
