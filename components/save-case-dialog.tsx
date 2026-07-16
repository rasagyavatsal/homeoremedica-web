'use client';

import { Check, Loader2, Save } from 'lucide-react';

import { DialogMasthead } from '@/components/dialog-masthead';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function SaveCaseDialog({
  open,
  onOpenChange,
  caseName,
  onCaseNameChange,
  isSaving,
  error,
  onSubmit,
  onCancel,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseName: string;
  onCaseNameChange: (value: string) => void;
  isSaving: boolean;
  error: string;
  onSubmit: (event?: React.FormEvent) => void;
  onCancel: () => void;
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="responsiveDialog" className="sm:max-w-xl">
        <DialogMasthead
          icon={<Save className="h-5 w-5" />}
          title="Save case"
          description="Enter a case name before saving the current search."
        />

        <form onSubmit={onSubmit} className="space-y-6 overflow-y-auto p-4 sm:p-6">
          <Field>
            <FieldLabel htmlFor="caseName">Case name</FieldLabel>
            <Input
              id="caseName"
              autoFocus
              placeholder="e.g. Patient A symptoms"
              value={caseName}
              onChange={(event) => onCaseNameChange(event.target.value)}
            />
          </Field>

          {error ? <Callout variant="destructive">{error}</Callout> : null}

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!caseName.trim() || isSaving} className="flex-grow-2 gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
