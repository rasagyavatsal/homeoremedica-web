import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCasesStore } from '@/lib/stores/cases-store';

export function useUserCases() {
  const { user } = useAuth();
  const { loadUserCases, clearCases, loading } = useCasesStore();

  useEffect(() => {
    if (user?.uid) {
      loadUserCases(user.uid);
    } else {
      clearCases();
    }
  }, [user?.uid, loadUserCases, clearCases]);

  return { loading };
}
