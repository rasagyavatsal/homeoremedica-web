import { createCasesStore } from '@/lib/stores/create-cases-store';
import { auth } from '@/lib/firebase';
import { apiClient } from '@/lib/api/client';

export const useCasesStore = createCasesStore({
  apiClient,
  getToken: async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ?? null;
  },
});
