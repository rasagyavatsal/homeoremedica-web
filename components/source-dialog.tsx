'use client';

import Image from 'next/image';
import { BookOpen, Check } from 'lucide-react';

import { DialogMasthead } from '@/components/dialog-masthead';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motionClassNames } from '@/lib/motion/system';
import { overlayRecipes } from '@/lib/overlay/system';
import type { BookInfo } from '@/lib/seo/book-data';
import { cn } from '@/lib/utils';

function SourceCover({
  book,
  children,
}: Readonly<{
  book: BookInfo;
  children?: React.ReactNode;
}>) {
  return (
    <span
      aria-hidden="true"
      className="relative mx-auto block w-20 overflow-hidden rounded-sm border border-border bg-surface-container-low sm:w-24"
    >
      <Image
        src={book.cover.src}
        alt=""
        width={book.cover.width}
        height={book.cover.height}
        sizes="96px"
        className="block h-auto w-full"
        loading="lazy"
        unoptimized
      />
      {children}
    </span>
  );
}

export function SourceDialog({
  open,
  onOpenChange,
  activeBookId,
  books,
  onSelectBook,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeBookId: string;
  books: BookInfo[];
  onSelectBook: (bookId: BookInfo['id']) => void;
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(overlayRecipes.dialog.centeredCompact, 'max-h-viewport-dialog')}>
        <DialogMasthead
          icon={<BookOpen className="h-5 w-5" />}
          title="Select source"
          description="Choose the source book used for remedy matching."
        />

        <div className="grid min-h-0 grid-cols-2 gap-2.5 overflow-y-auto p-4 sm:gap-3 sm:p-6">
          {books.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => onSelectBook(book.id)}
              aria-label={`Select source: ${book.fullName}`}
              aria-pressed={activeBookId === book.id}
              className={cn(
                `w-full rounded-lg border p-2 text-left ${motionClassNames.surface} ${motionClassNames.press}`,
                activeBookId === book.id
                  ? 'border-primary bg-accent'
                  : 'border-border bg-surface-bright hover:border-primary',
              )}
            >
              <div className="space-y-1.5">
                <SourceCover book={book}>
                  {activeBookId === book.id ? (
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                </SourceCover>

                <div className="space-y-1 px-0.5 pb-0.5">
                  <p className="index-label leading-tight text-foreground">{book.shortName}</p>
                  <p className="whitespace-pre-line text-xs leading-snug text-on-surface-variant">
                    {book.fullName}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
