"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, LogOut, Menu, Settings, Smartphone, X } from 'lucide-react';

import { BrandLockup } from '@/components/brand-lockup';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/ui/interactive';
import { MotionSection } from '@/components/ui/motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isGoogleUser, signOutUser } from '@/lib/auth/firebase-auth';
import { PLAY_STORE_URL } from '@/lib/constants/links';
import { useAuth } from '@/lib/contexts/auth-context';
import { motionClassNames } from '@/lib/motion/system';

function MenuLink({ href, children, external = false }: Readonly<{
  href: string;
  children: React.ReactNode;
  external?: boolean;
}>) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`flex min-h-touch items-center gap-3 border-b border-border py-3 text-sm font-medium text-foreground hover:text-primary ${motionClassNames.press}`}
    >
      <span className="flex-1">{children}</span>
      <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-on-surface-variant" />
    </Link>
  );
}

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => setIsMenuOpen(false), [pathname]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isFinder = pathname === '/find-remedy';
  const usesGoogleProvider = user ? isGoogleUser() : false;

  return (
    <header className="sticky top-3 z-50 mb-3">
      <div className="page-shell">
        <div className="overflow-hidden rounded-xl border border-border bg-background/90 shadow-soft backdrop-blur-lg">
          <div className="flex h-header items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/" aria-label="HomeoRemedica home" className="inline-flex min-h-touch items-center">
              <BrandLockup />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              <NavLink href="/find-remedy" active={isFinder}>Find remedy</NavLink>
              <NavLink href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">Android app</NavLink>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="header" className="hidden gap-3 px-2 sm:inline-flex" aria-label="Account menu">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                      <span className="max-w-32 truncate text-sm font-medium text-foreground">
                        {user.displayName || 'Account'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-2">
                    <div className="border-b border-border px-3 pb-3 pt-2">
                      <p className="text-sm font-medium text-foreground">{user.displayName || 'Account'}</p>
                      <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                    {usesGoogleProvider ? null : (
                      <>
                        <DropdownMenuItem className="mt-1 cursor-pointer" onClick={() => router.push('/settings')}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="ghost" size="header" className="hidden sm:inline-flex">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="header-icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {isMenuOpen ? (
            <MotionSection className="border-t border-border bg-background lg:hidden">
              <div className="grid gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <nav className="grid" aria-label="Primary mobile">
                  <MenuLink href="/find-remedy">Find remedy</MenuLink>
                  <MenuLink href={PLAY_STORE_URL} external>Android app</MenuLink>
                  <MenuLink href="/terms">Terms</MenuLink>
                  <MenuLink href="/privacy">Privacy</MenuLink>
                  <MenuLink href="/contact">Contact</MenuLink>
                </nav>

                {user ? (
                  <div className="grid gap-2 pb-2">
                    <div className="rounded-lg bg-surface-container-low p-4">
                      <p className="text-sm font-medium">{user.displayName || 'Account'}</p>
                      <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                    {usesGoogleProvider ? null : (
                      <Button variant="ghost" className="justify-start gap-2" onClick={() => router.push('/settings')}>
                        <Settings className="h-4 w-4" /> Settings
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" /> Log out
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pb-2">
                    <Button asChild><Link href="/auth/login">Sign in</Link></Button>
                    <Button asChild variant="outline"><Link href="/auth/signup">Create account</Link></Button>
                  </div>
                )}
              </div>
            </MotionSection>
          ) : null}
        </div>
      </div>
    </header>
  );
}
