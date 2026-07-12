"use client"

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';
import { CheckCircle, Eye, EyeOff, Key, Lock, Loader2 } from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ErrorAlert } from '@/components/error-alert';
import { MotionSafeShell, MotionSection } from '@/components/ui/motion';
import { Field, FieldHint, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/contexts/auth-context';
import { isGoogleUser, signOutUser } from '@/lib/auth/firebase-auth';
import { motionClassNames } from '@/lib/motion/system';
import { useAuthStore } from '@/lib/stores/auth-store';
import { validatePassword } from '@homeoremedica/shared';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const changePassword = useAuthStore((state) => state.changePassword);
  const router = useRouter();
  const signoutTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (signoutTimerRef.current) {
        globalThis.clearTimeout(signoutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (isGoogleUser()) {
      router.push('/');
    }
  }, [loading, router, user]);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setChangingPassword(true);
    setPasswordChangeError('');
    setPasswordChangeSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      setChangingPassword(false);
      return;
    }

    const result = validatePassword({
      password: newPassword,
      confirmPassword,
      currentPassword,
      email: user?.email || undefined,
      displayName: user?.displayName || undefined
    });

    if (!result.isValid) {
      const failedMessages = result.unmetRules
        .map(key => result.rules[key as keyof typeof result.rules]?.message)
        .join('. ');
      setPasswordChangeError(`Password does not meet requirements: ${failedMessages}`);
      setChangingPassword(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordChangeSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (signoutTimerRef.current) {
        globalThis.clearTimeout(signoutTimerRef.current);
      }

      signoutTimerRef.current = globalThis.setTimeout(async () => {
        try {
          await signOutUser();
        } finally {
          router.push('/auth/login?passwordChanged=1');
        }
      }, 2000);
    } catch (error: any) {
      setPasswordChangeError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <MotionSafeShell className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <Callout variant="default" icon={<Loader2 className="h-4 w-4 animate-spin" />}>
              Loading settings...
            </Callout>
          </MotionSafeShell>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const passwordValidation = newPassword ? validatePassword({ password: newPassword }) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <MotionSafeShell className="mx-auto max-w-2xl space-y-8 md:space-y-10">
            <MotionSection className="space-y-4">
              <h1 className="display-md text-foreground">Settings</h1>
              <div aria-hidden="true" className="rule-double w-16" />
            </MotionSection>

            <MotionSection>
              <Card className={motionClassNames.surface}>
              <CardHeader className="border-b-2 border-foreground/70">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-tertiary/35 bg-tertiary/[0.08] text-tertiary">
                    <Key className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Change password</CardTitle>

                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <Field>
                    <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="••••••••"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                        className={`absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:text-foreground ${motionClassNames.press}`}
                        aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="new-password">New password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Min 12 characters"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        className={`absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:text-foreground ${motionClassNames.press}`}
                        aria-label={showPasswords.new ? 'Hide new password' : 'Show new password'}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldHint>Min 12 characters with mixed case, numbers, and symbols.</FieldHint>
                    {newPassword && passwordValidation && (
                      <div className="mt-2 space-y-1 rounded-sm border border-border/40 border-l-[3px] border-l-foreground/50 bg-surface-bright p-3">
                        {[
                          { key: 'length', label: 'At least 12 characters' },
                          { key: 'uppercase', label: 'Uppercase letter (A-Z)' },
                          { key: 'lowercase', label: 'Lowercase letter (a-z)' },
                          { key: 'number', label: 'Number (0-9)' },
                          { key: 'symbol', label: 'Symbol (!@#$%^&*)' },
                        ].map((rule) => {
                          const isMet = passwordValidation.rules[rule.key as keyof typeof passwordValidation.rules]?.passed;
                          return (
                            <div key={rule.key} className={`flex items-center gap-2 text-xs ${isMet ? 'text-success' : 'text-muted-foreground'}`}>
                              <span>{isMet ? '✓' : '✗'}</span>
                              <span>{rule.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm new password"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                        className={`absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:text-foreground ${motionClassNames.press}`}
                        aria-label={showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <ErrorAlert message={passwordChangeError} />

                  {passwordChangeSuccess ? (
                    <Callout variant="success" icon={<CheckCircle className="h-4 w-4" />}>
                      Password updated successfully. You will be signed out shortly.
                    </Callout>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full gap-2"
                  >
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {changingPassword ? 'Updating password...' : 'Update password'}
                  </Button>
                </form>
              </CardContent>
              </Card>
            </MotionSection>
          </MotionSafeShell>
        </div>
      </main>

      <Footer />
    </div>
  );
}
