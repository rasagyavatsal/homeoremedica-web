import { cn } from '@/lib/utils';
import { InlineLink } from '@/components/ui/interactive';

interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

interface BreadcrumbsProps {
  readonly items: BreadcrumbItem[];
  readonly className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex flex-wrap items-center gap-x-1 gap-y-1 py-1 font-code text-xs tracking-label text-on-surface-variant',
        className,
      )}
    >
      <InlineLink href="/" className="font-medium">Home</InlineLink>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
          <span aria-hidden="true" className="select-none text-tertiary/70">/</span>
          {item.href ? (
            <InlineLink href={item.href} className="font-medium">{item.label}</InlineLink>
          ) : (
            <span className="max-w-breadcrumb truncate px-1.5 font-medium text-foreground sm:max-w-none">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
