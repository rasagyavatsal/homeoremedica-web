import { describe, expect, it } from 'vitest';
import {
  getEmailSignInErrorMessage,
  getEmailSignUpErrorMessage,
  getGoogleSignInErrorMessage,
} from '../error-helpers';

describe('error-helpers', () => {
  describe('getGoogleSignInErrorMessage', () => {
    it('returns custom message for known firebase google errors', () => {
      expect(getGoogleSignInErrorMessage({ code: 'auth/popup-closed-by-user' })).toBe('Sign-in cancelled. Please try again.');
      expect(getGoogleSignInErrorMessage({ code: 'auth/popup-blocked' })).toBe('Pop-up blocked. Please allow pop-ups for this site.');
      expect(getGoogleSignInErrorMessage({ code: 'backend/connection-failed' })).toBe('Unable to reach the server. Please check your connection and try again.');
    });

    it('returns fallback message/error message for unknown errors', () => {
      expect(getGoogleSignInErrorMessage({ message: 'Custom error message' })).toBe('Custom error message');
      expect(getGoogleSignInErrorMessage({})).toBe('Google sign-in failed. Please try again.');
    });
  });

  describe('getEmailSignInErrorMessage', () => {
    it('returns custom message for known email sign-in errors', () => {
      expect(getEmailSignInErrorMessage({ code: 'auth/user-not-found' })).toBe('Incorrect email or password.');
      expect(getEmailSignInErrorMessage({ code: 'auth/wrong-password' })).toBe('Incorrect email or password.');
      expect(getEmailSignInErrorMessage({ code: 'auth/user-disabled' })).toBe('This account has been disabled. Please contact support.');
    });

    it('returns fallback message/error message for unknown errors', () => {
      expect(getEmailSignInErrorMessage({ message: 'Generic error' })).toBe('Generic error');
      expect(getEmailSignInErrorMessage({})).toBe('Sign-in failed. Please try again.');
    });
  });

  describe('getEmailSignUpErrorMessage', () => {
    it('returns custom message for known email sign-up errors', () => {
      expect(getEmailSignUpErrorMessage({ code: 'auth/email-already-in-use' })).toBe('An account with this email already exists.');
      expect(getEmailSignUpErrorMessage({ code: 'auth/weak-password' })).toBe('Password does not meet minimum requirements.');
    });

    it('returns fallback message/error message for unknown errors', () => {
      expect(getEmailSignUpErrorMessage({ message: 'SignUp issue' })).toBe('SignUp issue');
      expect(getEmailSignUpErrorMessage({})).toBe('Sign-up failed. Please try again.');
    });
  });
});
