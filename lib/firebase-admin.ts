import 'server-only';
import * as adminSdk from 'firebase-admin';

function getFirebaseCredentialEnv() {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.FB_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.FB_ADMIN_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || process.env.FB_ADMIN_PRIVATE_KEY)?.replaceAll(String.raw`\n`, '\n'),
  };
}

function initializeWithExplicitCredentials() {
  const { projectId, clientEmail, privateKey } = getFirebaseCredentialEnv();

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  console.log('Initializing Firebase Admin with explicit service account credentials');
  return adminSdk.initializeApp({
    credential: adminSdk.credential.cert({
      projectId,
      clientEmail,
      privateKey
    }),
    projectId
  });
}

function initializeProductionApp() {
  console.log('Initializing Firebase Admin with default application credentials (production)');
  return adminSdk.initializeApp();
}

function initializeEmulatorApp(projectId?: string) {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  }
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  }

  console.log('Firebase Admin initialized in development (emulator) mode');
  return adminSdk.initializeApp({ projectId: projectId || 'homeoremedica' });
}

function initializeFirebaseAdminApp() {
  const explicitCredentialsApp = initializeWithExplicitCredentials();
  if (explicitCredentialsApp) {
    return explicitCredentialsApp;
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  if (isProduction) {
    return initializeProductionApp();
  }

  const { projectId } = getFirebaseCredentialEnv();
  if (process.env.USE_FIREBASE_EMULATOR === 'true') {
    return initializeEmulatorApp(projectId);
  }

  throw new Error(
    'Firebase Admin SDK credentials not found. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local, or set USE_FIREBASE_EMULATOR=true to use emulators.'
  );
}

function getFirebaseAdminApp() {
  if (adminSdk.apps.length === 0) {
    try {
      return initializeFirebaseAdminApp();
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      // Always re-throw - don't silently fall back to broken config
      throw error;
    }
  }

  return adminSdk.apps[0]!;
}

export { adminSdk };
export function getAdminDb() {
  return adminSdk.firestore(getFirebaseAdminApp());
}

export function getAdminAuth() {
  return adminSdk.auth(getFirebaseAdminApp());
}
