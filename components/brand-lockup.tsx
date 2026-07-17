import Image from 'next/image';

import { cn } from '@/lib/utils';

export function BrandLockup({ compact = false, className }: Readonly<{ compact?: boolean; className?: string }>) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span aria-hidden="true" className="relative block h-10 w-10 shrink-0 overflow-hidden">
        <Image
          src="/logo/logo-light-transparent.png"
          alt=""
          width={40}
          height={40}
          sizes="40px"
          className="absolute inset-0 h-full w-full scale-125 object-contain dark:hidden"
        />
        <Image
          src="/logo/logo-dark-transparent.png"
          alt=""
          width={40}
          height={40}
          sizes="40px"
          className="absolute inset-0 hidden h-full w-full scale-125 object-contain dark:block"
        />
      </span>
      {compact ? null : (
        <span className="font-display text-xl font-medium tracking-display text-foreground">
          HomeoRemedica
        </span>
      )}
    </span>
  );
}
