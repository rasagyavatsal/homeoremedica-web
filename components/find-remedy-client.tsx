"use client"

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Info,
  X,
} from 'lucide-react';
import type { Case } from '@/types';

import { CasesDialog } from '@/components/cases-dialog';
import { FinderWorkspace } from '@/components/finder-workspace';
import { Header } from '@/components/header';
import { SaveCaseDialog } from '@/components/save-case-dialog';
import { SourceDialog } from '@/components/source-dialog';
import { UnifiedSymptomSearch } from '@/components/unified-symptom-search';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { useAuth } from '@/lib/contexts/auth-context';
import { useUserCases } from '@/lib/hooks/use-user-cases';
import { getBookName, SEARCH_BOOKS } from '@/lib/seo/book-data';
import { useCasesStore } from '@/lib/stores/cases-store';
import { useSearchStore } from '@/lib/stores/search-store';

const SAVED_CASE_NOTICE_ID = 'book-identifiers-v1';

function savedCaseNoticeKey(userId: string) {
  return `homeoremedica:saved-case-update:${SAVED_CASE_NOTICE_ID}:${userId}`;
}

export default function FindRemedyClient() {
  const router = useRouter();
  const [casesModalOpen, setCasesModalOpen] = useState(false);
  const [booksModalOpen, setBooksModalOpen] = useState(false);
  const [saveCaseModalOpen, setSaveCaseModalOpen] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveCaseError, setSaveCaseError] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [savedCaseNotice, setSavedCaseNotice] = useState<{
    userId: string;
    dismissed: boolean;
  } | null>(null);

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
  const {
    cases,
    retiredCaseCount,
    addCase,
    selectCase,
    selectedCase,
    deleteCase,
  } = useCasesStore();

  useUserCases();

  useEffect(() => {
    if (!user?.uid) {
      setSavedCaseNotice(null);
      return;
    }

    setSavedCaseNotice({
      userId: user.uid,
      dismissed: globalThis.localStorage.getItem(savedCaseNoticeKey(user.uid)) === 'dismissed',
    });
  }, [user?.uid]);

  const activeBookName = getBookName(activeBook);
  const currentSearchHasContent = isSearchActive || selectedSymptoms.length > 0 || results.length > 0;

  useEffect(() => {
    if (selectedSymptoms.length > 0) {
      void findRemedies();
    }
  }, [activeBook, findRemedies, selectedSymptoms]);

  const displayCases = cases.filter(
    (caseItem) => typeof caseItem?.id === 'string' && caseItem.id.trim().length > 0,
  );

  const canManageCases = Boolean(user?.uid);
  const showSavedCaseNotice = Boolean(
    user?.uid &&
    retiredCaseCount > 0 &&
    savedCaseNotice?.userId === user.uid &&
    !savedCaseNotice.dismissed,
  );

  const dismissSavedCaseNotice = () => {
    if (!user?.uid) return;

    globalThis.localStorage.setItem(savedCaseNoticeKey(user.uid), 'dismissed');
    setSavedCaseNotice({ userId: user.uid, dismissed: true });
  };

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

  const handleSaveCase = () => {
    if (!user?.uid) {
      router.push('/auth/login');
      return;
    }

    setSaveCaseError('');
    setSaveCaseModalOpen(true);
  };

  const confirmSaveCase = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!caseName.trim()) return;

    setIsSaving(true);
    setSaveCaseError('');
    try {
      await addCase(caseName, selectedSymptoms, activeBook, user!.uid);
      setSaveCaseModalOpen(false);
      setCaseName('');
      setCasesModalOpen(true);
    } catch (error: any) {
      console.error('Save case error:', error);
      setSaveCaseError(error?.message || 'Failed to save case. Please try again.');
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

      <FinderWorkspace
        notice={showSavedCaseNotice ? (
          <Callout variant="info" icon={<Info className="h-4 w-4" />}>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <p className="font-medium text-foreground">Saved-case update</p>
                <p>
                  {retiredCaseCount} older saved {retiredCaseCount === 1 ? 'case' : 'cases'} may no longer appear because we updated the source books used by HomeoRemedica. New cases will continue to save normally.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 shrink-0"
                onClick={dismissSavedCaseNotice}
                aria-label="Dismiss saved-case update"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Callout>
        ) : null}
        search={(
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
        )}
        symptoms={selectedSymptoms}
        results={results}
        activeBookName={activeBookName}
        onSaveCase={handleSaveCase}
        onClear={clearSymptoms}
        onRemove={removeSymptom}
      />

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
        error={saveCaseError}
        onSubmit={confirmSaveCase}
        onCancel={() => setSaveCaseModalOpen(false)}
      />

      <SourceDialog
        open={booksModalOpen}
        onOpenChange={setBooksModalOpen}
        activeBookId={activeBook}
        books={SEARCH_BOOKS}
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
