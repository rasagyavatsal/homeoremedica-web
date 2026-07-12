import { cn } from '@/lib/utils';

/*
 * Printer's section break: hairlines flanking a fleuron, the mark used
 * between entries in period materia medica. Purely decorative.
 */
export function OrnamentRule({ className }: Readonly<{ className?: string }>) {
  return (
    <div aria-hidden="true" className={cn('flex items-center gap-4', className)}>
      <span className="h-px flex-1 bg-border/45" />
      <span className="select-none font-display text-lg leading-none text-tertiary/80">❧</span>
      <span className="h-px flex-1 bg-border/45" />
    </div>
  );
}
