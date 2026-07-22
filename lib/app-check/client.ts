import {
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';

import app from '@/lib/firebase';

let appCheck: AppCheck | undefined;

function getConfiguredAppCheck() {
  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY;
  if (typeof window === 'undefined' || !siteKey) return undefined;

  appCheck ??= initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: false,
  });

  return appCheck;
}

// Initialize before Firebase Auth starts so Firebase-managed requests are also
// eligible for App Check protection.
getConfiguredAppCheck();

export async function getAppCheckToken() {
  const configuredAppCheck = getConfiguredAppCheck();
  if (!configuredAppCheck) return null;

  try {
    return (await getToken(configuredAppCheck)).token;
  } catch {
    console.warn('App Check token unavailable; continuing without attestation.');
    return null;
  }
}
