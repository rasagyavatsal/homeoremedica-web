"use client"

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  LogOut,
  Menu,
  Settings,
  Smartphone,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MotionSection } from '@/components/ui/motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/contexts/auth-context';
import { isGoogleUser, signOutUser } from '@/lib/auth/firebase-auth';
import { motionClassNames } from '@/lib/motion/system';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavLink } from '@/components/ui/interactive';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rasagyavatsal.homeoremedica';

function MenuIndexLink({
  href,
  children,
  external = false,
}: Readonly<{
  href: string;
  children: React.ReactNode;
  external?: boolean;
}>) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`flex items-center gap-3 border-b border-border/30 px-1 py-3.5 text-sm font-medium text-foreground transition-colors hover:text-tertiary ${motionClassNames.press}`}
    >
      <span className="flex-1">{children}</span>
      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 self-center text-on-surface-variant/60" />
    </Link>
  );
}

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isHome = pathname === '/';
  const usesGoogleProvider = user ? isGoogleUser() : false;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-9 items-center gap-3">
          <picture>
            <source srcSet="/favicon.avif" type="image/avif" />
            <img src="/favicon.png" alt="" className="h-8 w-8 rounded-sm border border-foreground/15" />
          </picture>
          <span className="block font-display text-lg font-medium tracking-display text-foreground">
            HomeoRemedica
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <NavLink href="/" active={isHome}>
            Find Remedy
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button asChild variant="outline" size="header" className="hidden gap-2 md:inline-flex">
            <Link href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Smartphone className="h-4 w-4 text-tertiary" />
              Android App
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="header"
                  className="hidden gap-3 px-2 sm:inline-flex"
                  aria-label="Account menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary/35 bg-primary/10 font-display text-sm font-medium text-primary">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-32 truncate text-sm font-medium text-foreground">
                    {user.displayName || 'Account'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2">
                <div className="space-y-1 border-b-2 border-foreground/70 px-3 pb-3 pt-2">
                  <p className="text-sm font-medium text-foreground">
                    {user.displayName || 'Account'}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
                </div>
                {usesGoogleProvider ? null : (
                  <>
                    <DropdownMenuItem
                      className="mt-1 cursor-pointer rounded-sm"
                      onClick={() => router.push('/settings')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="cursor-pointer rounded-sm text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="header" className="hidden md:inline-flex">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="header-icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div aria-hidden="true" className="rule-double-b" />

      {isMenuOpen ? (
        <MotionSection className="bg-background lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6">
            <nav className="grid" aria-label="Primary mobile">
              <MenuIndexLink href="/">
                Find Remedy
              </MenuIndexLink>
              <MenuIndexLink href={PLAY_STORE_URL} external>
                Android App
              </MenuIndexLink>
              <MenuIndexLink href="/privacy">
                Privacy
              </MenuIndexLink>
              <MenuIndexLink href="/contact">
                Contact
              </MenuIndexLink>
            </nav>

            <div className="grid gap-2 pb-2">
              {user ? (
                <>
                  <div className="border-l-[3px] border-primary bg-surface-bright px-4 py-3">
                    <p className="text-sm font-medium text-foreground">
                      {user.displayName || 'Account'}
                    </p>
                    <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
                  </div>
                  {usesGoogleProvider ? null : (
                    <Button
                      variant="ghost"
                      className="justify-start gap-2"
                      onClick={() => router.push('/settings')}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  )}
                  <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <div className="grid gap-2">
                  <Button asChild className="justify-center">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-center">
                    <Link href="/auth/signup">Create account</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div aria-hidden="true" className="rule-heavy" />
        </MotionSection>
      ) : null}
    </header>
  );
}
