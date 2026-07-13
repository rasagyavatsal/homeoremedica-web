"use client"

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, User, Lock } from 'lucide-react';

import { ErrorAlert } from '@/components/error-alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { validatePassword, PASSWORD_RULES } from '@homeoremedica/shared';
import { AuthPageShell } from '../_components/auth-page-shell';
import { PasswordField } from '../_components/password-field';
import { TextField } from '../_components/text-field';
import { GoogleSignInSection } from '../_components/google-sign-in-section';
import { PasswordRequirements } from '../_components/password-requirements';
import { getEmailSignUpErrorMessage } from '../_lib/error-helpers';
import { useAuthRedirect } from '../_hooks/use-auth-redirect';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuthStore();
  const router = useRouter();

  useAuthRedirect();

  const passwordResult = (password.length > 0 || isPasswordFocused)
    ? validatePassword({ password, confirmPassword, email, displayName: name })
    : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const submitResult = validatePassword({
      password,
      confirmPassword,
      email,
      displayName: name
    });

    if (!submitResult.isValid) {
      const failedMessages = submitResult.unmetRules
        .map(key => PASSWORD_RULES[key.toUpperCase() as keyof typeof PASSWORD_RULES])
        .filter(Boolean)
        .join('. ');
      setError(`Password does not meet requirements: ${failedMessages}`);
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, name);
      router.push('/find-remedy');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(getEmailSignUpErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign up</CardTitle>
        <CardDescription>Save cases across devices.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            id="name"
            label="Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            icon={User}
            required
          />

          <TextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            icon={Mail}
            required
          />

          <div>
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              placeholder="Min 12 characters"
              required
            />
            <PasswordRequirements passwordResult={passwordResult} />
          </div>

          <TextField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            icon={Lock}
            required
          />

          <ErrorAlert message={error} />

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <GoogleSignInSection onError={setError} />

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-tertiary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs leading-relaxed text-on-surface-variant">
          By signing up, you agree to our{' '}
          <Link href="/privacy" className="underline decoration-tertiary/40 underline-offset-4 hover:text-tertiary">
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>
    </AuthPageShell>
  );
}
