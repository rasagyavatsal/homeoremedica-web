'use client';

import { Check, FileText, Trash2 } from 'lucide-react';

import { DialogMasthead } from '@/components/dialog-masthead';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motionClassNames } from '@/lib/motion/system';
import { cn } from '@/lib/utils';
import type { Case } from '@/types';

function prettyBook(bookId: string) {
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
}

export function CasesDialog({
  open,
  onOpenChange,
  cases,
  selectedCaseId,
  canManageCases,
  onLoadCase,
  onDeleteCase,
  onLogin,
  manageFocus = true,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: Case[];
  selectedCaseId?: string | null;
  canManageCases: boolean;
  onLoadCase: (caseItem: Case) => void;
  onDeleteCase: (caseId: string) => void;
  onLogin: () => void;
  manageFocus?: boolean;
}>) {
  let content;

  if (canManageCases && cases.length > 0) {
    content = (
      <div className="space-y-3">
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className={cn(
              `relative rounded-lg border px-4 py-4 transition-colors ${motionClassNames.surface}`,
              selectedCaseId === caseItem.id
                ? 'border-primary bg-accent'
                : 'border-border bg-surface-bright hover:border-primary',
            )}
          >
            <button
              type="button"
              onClick={() => onLoadCase(caseItem)}
              className="block w-full pr-10 text-left"
            >
              <div className="space-y-2">
                <p className="font-display text-base font-medium tracking-display text-foreground">{caseItem.name}</p>
                <div className="index-label flex flex-wrap items-center gap-2">
                  <span>{caseItem.timestamp.toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span>{prettyBook(caseItem.bookId ?? 'all')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{caseItem.selectedSymptoms?.length ?? 0} symptoms</span>
                </div>
              </div>
            </button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteCase(caseItem.id);
              }}
              aria-label={`Delete ${caseItem.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {selectedCaseId === caseItem.id ? (
              <div className="absolute right-12 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  } else if (canManageCases) {
    content = (
      <div className="flex flex-col items-start gap-4">
        <Callout variant="default" className="w-full">
          No saved cases yet. Create one after running a search.
        </Callout>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col items-start gap-4">
        <Button onClick={onLogin} className="w-full sm:w-auto">
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="responsiveDialog"
        className="sm:max-w-2xl"
        onOpenAutoFocus={manageFocus ? undefined : (event) => event.preventDefault()}
        onCloseAutoFocus={manageFocus ? undefined : (event) => event.preventDefault()}
      >
        <DialogMasthead
          icon={<FileText className="h-5 w-5" />}
          title="Saved cases"
          description={canManageCases ? 'Saved cases available to review.' : 'Sign in to access saved cases.'}
          descriptionVisible={!canManageCases}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
