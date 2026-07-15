"use client"

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';

import { ErrorAlert } from '@/components/error-alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AuthPageShell } from '../_components/auth-page-shell';
import { PasswordField } from '../_components/password-field';
import { TextField } from '../_components/text-field';
import { GoogleSignInSection } from '../_components/google-sign-in-section';
import { getEmailSignInErrorMessage } from '../_lib/error-helpers';
import { useAuthRedirect } from '../_hooks/use-auth-redirect';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuthStore();
  const router = useRouter();

  useAuthRedirect();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/find-remedy');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(getEmailSignInErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            rightLabel={
              <Link href="/auth/reset-password" className="text-sm font-medium text-tertiary underline underline-offset-4">
                Forgot password?
              </Link>
            }
          />

          <ErrorAlert message={error} />

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <GoogleSignInSection onError={setError} />

        <p className="text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-tertiary underline-offset-4 hover:underline">
            Sign up free
          </Link>
        </p>
      </CardContent>
    </AuthPageShell>
  );
}
