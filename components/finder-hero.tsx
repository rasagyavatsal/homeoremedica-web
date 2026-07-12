import type { ReactNode } from 'react';

import { MotionSection } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

interface FinderHeroProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly descriptionClassName?: string;
  readonly align?: 'left' | 'center';
  readonly className?: string;
}

export function FinderHero({ title, description, descriptionClassName, align = 'left', className }: FinderHeroProps) {
  const centered = align === 'center';

  return (
    <MotionSection className={cn('space-y-4', centered && 'text-center', className)}>
      <div className={cn('space-y-4', centered && 'mx-auto max-w-3xl')}>
        <h1 className="display-lg text-foreground">{title}</h1>
        <div aria-hidden="true" className={cn('rule-double w-16', centered && 'mx-auto')} />
        {description ? (
          <p className={cn('max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-lg', centered && 'mx-auto', descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
    </MotionSection>
  );
}
