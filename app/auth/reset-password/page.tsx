"use client"

import { useState } from 'react';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorAlert } from '@/components/error-alert';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { sendPasswordReset } from '@/lib/auth/firebase-auth';
import { motionClassNames } from '@/lib/motion/system';
import { AuthPageShell } from '../_components/auth-page-shell';
import { controlVariants } from '@/lib/controls/system';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthPageShell showBrand={false}>
        <CardContent className="space-y-6 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-tertiary/35 bg-tertiary/[0.08] text-tertiary">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              Reset link sent to <span className="font-medium text-foreground">{email}</span>.
            </CardDescription>
          </div>

          <Callout variant="default" className="text-sm text-left">
            Click the link in the email to reset your password. If you do not see it, check your spam folder.
          </Callout>

          <div className="space-y-3">
            <Button asChild className="w-full gap-2">
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
            >
              Send another email
            </Button>
          </div>
        </CardContent>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell showBrand={false}>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-tertiary/35 bg-tertiary/[0.08] text-tertiary">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          <ErrorAlert message={error} />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className={cn(
                controlVariants({ size: 'inline-link', shape: 'sm', ring: 'strong' }),
                `inline-flex items-center justify-center text-on-surface-variant underline-offset-4 transition-colors hover:text-tertiary hover:underline ${motionClassNames.press}`
              )}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>
      </CardContent>
    </AuthPageShell>
  );
}
