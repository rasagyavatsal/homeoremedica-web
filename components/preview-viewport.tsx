import { cn } from '@/lib/utils';

export function PreviewViewport({
  label,
  src,
  className,
}: Readonly<{
  label: string;
  src: string;
  className?: string;
}>) {
  return (
    <section
      aria-label={label}
      className={cn(
        'preview-device aspect-preview-mobile max-w-preview-mobile md:aspect-preview-desktop md:max-w-preview-desktop',
        className,
      )}
    >
      <iframe
        title={label}
        src={src}
        className="preview-viewport"
      />
    </section>
  );
}
