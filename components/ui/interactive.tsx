import React from 'react';
import Link, { LinkProps } from 'next/link';
import { controlVariants } from '@/lib/controls/system';
import { motionClassNames } from '@/lib/motion/system';
import { cn } from '@/lib/utils';

export interface PillLinkProps extends LinkProps {
  readonly children: React.ReactNode;
  readonly active?: boolean;
  readonly className?: string;
}

export function PillLink({ href, children, active = false, className, ...props }: Readonly<PillLinkProps>) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        controlVariants({ size: 'pill', shape: 'sm', ring: 'strong' }),
        `inline-flex items-center justify-center border font-code text-xs tracking-label transition-colors ${motionClassNames.press}`,
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export interface NavLinkProps extends LinkProps, Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> {
  readonly children: React.ReactNode;
  readonly active?: boolean;
  readonly className?: string;
}

export function NavLink({ href, children, active = false, className, ...props }: Readonly<NavLinkProps>) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        controlVariants({ size: 'header', shape: 'sm' }),
        `inline-flex items-center font-medium transition-colors ${motionClassNames.press}`,
        active
          ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
          : 'text-on-surface-variant hover:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export interface InlineLinkProps extends LinkProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly external?: boolean;
}

export function InlineLink({ href, children, className, external, ...props }: Readonly<InlineLinkProps>) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        controlVariants({ size: 'inline-link', shape: 'sm', ring: 'strong' }),
        `inline-flex items-center underline-offset-4 transition-colors hover:text-primary hover:underline ${motionClassNames.press}`,
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
