export function getGoogleSignInErrorMessage(err: any): string {
  const code = err?.code;

  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in cancelled. Please try again.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Pop-up blocked. Please allow pop-ups for this site.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized. Please contact support.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled. Please contact support.';
  }
  if (code === 'backend/connection-failed') {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection and try again.';
  }

  return err?.message || 'Google sign-in failed. Please try again.';
}

export function getEmailSignInErrorMessage(err: any): string {
  const code = err?.code;

  if (code === 'backend/connection-failed') {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  if (
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-login-credentials'
  ) {
    return 'Incorrect email or password.';
  }

  if (code === 'auth/invalid-email') {
    return 'Invalid email address.';
  }

  if (code === 'auth/user-disabled') {
    return 'This account has been disabled. Please contact support.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later or reset your password.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Email/password sign-in is not enabled. Please contact support.';
  }

  const message = typeof err?.message === 'string' ? err.message.trim() : '';
  if (message) return message;

  return 'Sign-in failed. Please try again.';
}

export function getEmailSignUpErrorMessage(err: any): string {
  const code = err?.code;

  if (code === 'backend/connection-failed') {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists.';
  }

  if (code === 'auth/weak-password') {
    return 'Password does not meet minimum requirements.';
  }

  if (code === 'auth/invalid-email') {
    return 'Invalid email address.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Email/password sign-up is not enabled. Please contact support.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later.';
  }

  const message = typeof err?.message === 'string' ? err.message.trim() : '';
  if (message) return message;

  return 'Sign-up failed. Please try again.';
}
