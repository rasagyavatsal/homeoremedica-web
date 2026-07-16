import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function DialogMasthead({
  icon,
  title,
  description,
  descriptionVisible = false,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  description: string;
  descriptionVisible?: boolean;
}>) {
  return (
    <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          {icon}
        </div>
        <div className="space-y-1 text-left">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className={descriptionVisible ? 'text-sm text-on-surface-variant' : 'sr-only'}>
            {description}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}
