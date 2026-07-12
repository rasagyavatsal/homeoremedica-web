import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { createFirebaseAuthCore, mapFirebaseUser } from '@homeoremedica/shared';
import type { FirebaseUser } from '@homeoremedica/shared';

const core = createFirebaseAuthCore({
  auth,
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return mapFirebaseUser(userCredential.user);
  },
  tokenConfig: {
    timeoutMs: 4000,
    maxAttempts: 3,
    backoffMs: 200,
  },
});

export type { FirebaseUser };

export const signInWithEmail = core.signInWithEmail;
export const signUpWithEmail = core.signUpWithEmail;
export const signInWithGoogle = core.signInWithGoogle;
export const signOutUser = core.signOutUser;
export const getCurrentUserToken = core.getCurrentUserToken;
export const onIdTokenChange = core.onIdTokenChange;
export const isGoogleUser = core.isGoogleUser;
export const sendPasswordReset = core.sendPasswordReset;
export const changePassword = core.changePassword;
