"use client"

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Loader2,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { Case } from '@/types';

import { Header } from '@/components/header';
import { UnifiedSymptomSearch } from '@/components/unified-symptom-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MotionGroup, MotionItem, MotionSafeShell, MotionSection } from '@/components/ui/motion';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { motionClassNames } from '@/lib/motion/system';
import { overlayRecipes } from '@/lib/overlay/system';
import { cn, formatRemedyDisplayName } from '@/lib/utils';
import { useAuth } from '@/lib/contexts/auth-context';
import { useUserCases } from '@/lib/hooks/use-user-cases';
import { getBookInfo, getBookOptions, type BookInfo } from '@/lib/seo/book-data';
import { useCasesStore } from '@/lib/stores/cases-store';
import { useSearchStore } from '@/lib/stores/search-store';

type SearchResult = {
  remedy: {
    id: string;
    name: string;
    book?: string;
  };
  score: number;
  matchedSymptoms: string[];
};

function prettyBook(bookId: string) {
  return bookId.charAt(0).toUpperCase() + bookId.slice(1);
}

function summarizeMatches(matches: string[]) {
  if (matches.length === 0) return null;

  const preview = matches.slice(0, 3);
  const remaining = matches.length - preview.length;

  return remaining > 0
    ? `${preview.join(' · ')} · +${remaining} more`
    : preview.join(' · ');
}

const SOURCE_SHORT_LABELS: Record<BookInfo['id'], string> = {
  boericke: 'Boericke',
  clarke: 'Clarke',
  kent: 'Kent',
  allen: 'Allen',
};

const SOURCE_COVER_IMAGES: Record<BookInfo['id'], { src: string; width: number; height: number }> = {
  boericke: { src: '/source-covers/boericke.jpg', width: 301, height: 371 },
  clarke: { src: '/source-covers/clarke.jpg', width: 298, height: 411 },
  kent: { src: '/source-covers/kent.jpg', width: 366, height: 543 },
  allen: { src: '/source-covers/allen.jpg', width: 223, height: 275 },
};

const SOURCE_COVER_FALLBACK_ACCENTS: Record<BookInfo['id'], string> = {
  boericke: 'bg-surface-container-low',
  clarke: 'bg-surface-container-low',
  kent: 'bg-surface-container-low',
  allen: 'bg-surface-container-low',
};

function SourceCover({
  bookId,
  className,
  children,
}: Readonly<{
  bookId: BookInfo['id'];
  className?: string;
  children?: React.ReactNode;
}>) {
  const cover = SOURCE_COVER_IMAGES[bookId];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block overflow-hidden rounded-sm border border-border',
        SOURCE_COVER_FALLBACK_ACCENTS[bookId],
        className,
      )}
    >
      <Image
        src={cover.src}
        alt=""
        width={cover.width}
        height={cover.height}
        sizes="96px"
        className="block h-auto w-full"
        loading="lazy"
        unoptimized
      />
      {children}
    </span>
  );
}

function DialogMasthead({
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

function SelectedSymptomsPanel({
  symptoms,
  activeBookName,
  onSaveCase,
  onClear,
  onRemove,
}: Readonly<{
  symptoms: Array<{ id: string; name: string }>;
  activeBookName: string;
  onSaveCase: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}>) {
  if (symptoms.length === 0) return null;

  return (
    <MotionSection>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-border sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <CardTitle className="text-lg md:text-xl">Selected symptoms</CardTitle>
            <p className="index-label">
              {symptoms.length} {symptoms.length === 1 ? 'entry' : 'entries'} · {activeBookName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onSaveCase} variant="outline" size="sm" className="shrink-0">
              Save case
            </Button>
            <Button onClick={onClear} variant="ghost" size="sm" className="shrink-0">
              Clear all
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div>
            {symptoms.map((symptom, index) => (
              <div
                key={symptom.id}
                className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
              >
                <div className="flex min-w-0 gap-3">
                  <p
                    aria-hidden="true"
                    className="index-label select-none pt-0.5 text-primary"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <div className="min-w-0">
                    <p className="break-words text-sm leading-relaxed text-foreground">
                      {symptom.name}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(symptom.id)}
                  aria-label={`Remove ${symptom.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MotionSection>
  );
}

function ResultsPanel({
  results,
  activeBookName,
  selectedCount,
}: Readonly<{
  results: SearchResult[];
  activeBookName: string;
  selectedCount: number;
}>) {
  if (results.length === 0) return null;

  return (
    <MotionSection>
      <Card>
        <CardHeader className="border-b border-border md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-xl md:text-2xl">Matching remedies</CardTitle>
            <p className="index-label">
              {results.length} {results.length === 1 ? 'remedy' : 'remedies'} · {activeBookName}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <Callout
            variant="info"
            icon={<AlertCircle className="h-4 w-4" />}
            className="text-sm"
          >
            These results are for reference only. Consult a qualified practitioner before treatment.
          </Callout>

          <MotionGroup stagger={0.03}>
            {results.map((result) => {
              const sourceBook = result.remedy.book ? prettyBook(result.remedy.book) : activeBookName;
              const summary = summarizeMatches(result.matchedSymptoms);
              const matchLabel =
                selectedCount > 0
                  ? `Matches ${result.score} of ${selectedCount}`
                  : `${result.score} ${result.score === 1 ? 'match' : 'matches'}`;

              return (
                <MotionItem key={result.remedy.id}>
                  <div className="border-b border-border px-1 py-5 last:border-b-0">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-lg font-medium text-foreground transition-colors group-hover:text-primary">
                        {formatRemedyDisplayName(result.remedy.name)}
                      </h3>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="default">{matchLabel}</Badge>
                      <Badge variant="outline">{sourceBook}</Badge>
                    </div>

                    {summary ? (
                      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                        {summary}
                      </p>
                    ) : null}
                  </div>
                </MotionItem>
              );
            })}
          </MotionGroup>
        </CardContent>
      </Card>
    </MotionSection>
  );
}

function CasesDialog({
  open,
  onOpenChange,
  cases,
  selectedCaseId,
  canManageCases,
  onLoadCase,
  onDeleteCase,
  onLogin,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: Case[];
  selectedCaseId?: string | null;
  canManageCases: boolean;
  onLoadCase: (caseItem: Case) => void;
  onDeleteCase: (caseId: string) => void;
  onLogin: () => void;
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
      <DialogContent variant="responsiveDialog" className="sm:max-w-2xl">
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

function SaveCaseDialog({
  open,
  onOpenChange,
  caseName,
  onCaseNameChange,
  isSaving,
  onSubmit,
  onCancel,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseName: string;
  onCaseNameChange: (value: string) => void;
  isSaving: boolean;
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

function SourceDialog({
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
              aria-label={`Select source: ${book.name}`}
              aria-pressed={activeBookId === book.id}
              className={cn(
                `w-full rounded-lg border p-2 text-left ${motionClassNames.surface} ${motionClassNames.press}`,
                activeBookId === book.id
                  ? 'border-primary bg-accent'
                  : 'border-border bg-surface-bright hover:border-primary',
              )}
            >
              <div className="space-y-1.5">
                <SourceCover bookId={book.id} className="mx-auto w-20 sm:w-24">
                  {activeBookId === book.id ? (
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                </SourceCover>

                <div className="space-y-1 px-0.5 pb-0.5">
                  <p className="index-label leading-tight text-foreground">
                    {SOURCE_SHORT_LABELS[book.id]}
                  </p>
                  <p className="text-xs leading-snug text-on-surface-variant">
                    {book.name}
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

export default function FindRemedyClient() {
  const router = useRouter();
  const [casesModalOpen, setCasesModalOpen] = useState(false);
  const [booksModalOpen, setBooksModalOpen] = useState(false);
  const [saveCaseModalOpen, setSaveCaseModalOpen] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResetSignal, setSearchResetSignal] = useState(0);

  const {
    selectedSymptoms,
    results,
    findRemedies,
    clearSymptoms,
    addSymptom,
    removeSymptom,
    activeBook,
    setActiveBook,
  } = useSearchStore();

  const { user } = useAuth();
  const { cases, addCase, selectCase, selectedCase, deleteCase } = useCasesStore();

  useUserCases();

  const bookOptions = getBookOptions();
  const activeBookInfo = getBookInfo(activeBook);
  const activeBookName = activeBookInfo?.name ?? prettyBook(activeBook);
  const currentSearchHasContent = isSearchActive || selectedSymptoms.length > 0 || results.length > 0;

  const displayCases = cases.filter(
    (caseItem) => typeof caseItem?.id === 'string' && caseItem.id.trim().length > 0,
  );

  const canManageCases = Boolean(user?.uid);

  const resetCurrentSearch = () => {
    setSearchResetSignal((current) => current + 1);
    setIsSearchActive(false);
    clearSymptoms();
    selectCase(null);
  };

  const shouldReplaceCurrentSearch = (message: string) => {
    if (!currentSearchHasContent) {
      return true;
    }

    return globalThis.confirm(message);
  };

  const handleFindRemedies = async () => {
    if (selectedSymptoms.length === 0) {
      return;
    }

    try {
      await findRemedies();
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSaveCase = () => {
    if (!user?.uid) {
      router.push('/auth/login');
      return;
    }

    setSaveCaseModalOpen(true);
  };

  const confirmSaveCase = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!caseName.trim()) return;

    setIsSaving(true);
    try {
      await addCase(caseName, selectedSymptoms, activeBook, user!.uid);
      setSaveCaseModalOpen(false);
      setCaseName('');
      setCasesModalOpen(true);
    } catch (error: any) {
      console.error('Save case error:', error);
      globalThis.alert(error?.message || 'Failed to save case. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!globalThis.confirm('Delete this case?')) {
      return;
    }

    try {
      await deleteCase(caseId);
    } catch (error: any) {
      console.error('Delete case error:', error);
      globalThis.alert(error?.message || 'Failed to delete case. Please try again.');
    }
  };

  const handleLoadCaseSymptoms = (caseItem: Case) => {
    const shouldLoadCase = shouldReplaceCurrentSearch(
      'Load this saved case and replace the current search?',
    );

    if (!shouldLoadCase) {
      return;
    }

    resetCurrentSearch();

    if (caseItem.bookId) {
      setActiveBook(caseItem.bookId);
    }

    caseItem.selectedSymptoms?.forEach((symptom) => {
      addSymptom(symptom);
    });

    selectCase(caseItem.id);
    setCasesModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <h1 className="sr-only">Find a homoeopathic remedy</h1>
        <MotionSafeShell className="page-shell min-h-viewport-below-header flex flex-col gap-5 py-5 lg:py-8">
          <MotionSection>
            <UnifiedSymptomSearch
              selectedSymptoms={selectedSymptoms}
              onOpenCases={() => setCasesModalOpen(true)}
              onOpenBooks={() => setBooksModalOpen(true)}
              onSearchActive={setIsSearchActive}
              resetSignal={searchResetSignal}
              onSymptomSelect={(symptom: string) => {
                const existing = selectedSymptoms.find((item) => item.name === symptom);
                if (existing) {
                  removeSymptom(existing.id);
                  return;
                }

                addSymptom({
                  id: `unified-${symptom.trim().replace(/\s+/g, '-')}`,
                  name: symptom,
                  books: [activeBook],
                });
              }}
            />
          </MotionSection>

          <MotionSection
            className="flex flex-wrap items-center gap-3"
          >
            <Button
              type="button"
              onClick={handleFindRemedies}
              disabled={selectedSymptoms.length === 0}
              aria-label="Find remedies"
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Find remedies
              {selectedSymptoms.length > 0 ? (
                <span
                  aria-hidden="true"
                  className="rounded-full bg-primary-foreground/20 px-2 py-1 font-code text-micro leading-none tracking-label"
                >
                  {String(selectedSymptoms.length).padStart(2, '0')}
                </span>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </MotionSection>

          <SelectedSymptomsPanel
            symptoms={selectedSymptoms}
            activeBookName={activeBookName}
            onSaveCase={handleSaveCase}
            onClear={clearSymptoms}
            onRemove={removeSymptom}
          />

          <ResultsPanel
            results={results as SearchResult[]}
            activeBookName={activeBookName}
            selectedCount={selectedSymptoms.length}
          />
        </MotionSafeShell>
      </main>

      <CasesDialog
        open={casesModalOpen}
        onOpenChange={setCasesModalOpen}
        cases={displayCases}
        selectedCaseId={selectedCase?.id ?? null}
        canManageCases={canManageCases}
        onLoadCase={handleLoadCaseSymptoms}
        onDeleteCase={handleDeleteCase}
        onLogin={() => router.push('/auth/login')}
      />

      <SaveCaseDialog
        open={saveCaseModalOpen}
        onOpenChange={setSaveCaseModalOpen}
        caseName={caseName}
        onCaseNameChange={setCaseName}
        isSaving={isSaving}
        onSubmit={confirmSaveCase}
        onCancel={() => setSaveCaseModalOpen(false)}
      />

      <SourceDialog
        open={booksModalOpen}
        onOpenChange={setBooksModalOpen}
        activeBookId={activeBook}
        books={bookOptions}
        onSelectBook={(bookId) => {
          if (bookId === activeBook) {
            setBooksModalOpen(false);
            return;
          }

          const shouldSwitchSource = shouldReplaceCurrentSearch(
            'Change source and clear the current search?',
          );

          if (!shouldSwitchSource) {
            return;
          }

          resetCurrentSearch();
          setActiveBook(bookId);
          setBooksModalOpen(false);
        }}
      />
    </div>
  );
}
