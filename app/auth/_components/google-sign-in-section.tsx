"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getGoogleSignInErrorMessage } from '../_lib/error-helpers';

interface GoogleSignInSectionProps {
  readonly onError: (message: string) => void;
}

export function GoogleSignInSection({ onError }: GoogleSignInSectionProps) {
  const { signInWithGoogle, loading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleGoogle = async () => {
    onError('');
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      router.push('/find-remedy');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      onError(getGoogleSignInErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isDisabled = loading || isGoogleLoading;

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/45" />
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-none">
          <span className="bg-card px-4 text-on-surface-variant">
            Or
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleGoogle}
        disabled={isDisabled}
      >
        <Chrome className="h-5 w-5" />
        Continue with Google
      </Button>
    </>
  );
}
