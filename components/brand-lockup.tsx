import { cn } from '@/lib/utils';

export function BrandLockup({ compact = false, className }: Readonly<{ compact?: boolean; className?: string }>) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span aria-hidden="true" className="brand-mark shrink-0" />
      {compact ? null : (
        <span className="font-display text-base font-medium tracking-display text-foreground">
          HomeoRemedica
        </span>
      )}
    </span>
  );
}
