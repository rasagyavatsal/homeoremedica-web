import type { NextRequest } from 'next/server';

import type { ApiError } from '@/lib/types/backend';

type AppCheckMode = 'off' | 'monitor' | 'enforce';
type AppCheckResult = 'off' | 'valid' | 'missing' | 'invalid';

function getMode(): AppCheckMode {
  const mode = process.env.APP_CHECK_ENFORCEMENT_MODE;
  return mode === 'monitor' || mode === 'enforce' ? mode : 'off';
}

function createAppCheckError(): ApiError {
  return {
    code: 'APP_CHECK_REQUIRED',
    message: 'A valid Firebase App Check token is required.',
  };
}

function describeRequest(request: NextRequest) {
  return `${request.method} ${request.nextUrl.pathname}`;
}

async function verifyAppCheckToken(token: string) {
  const { getAdminAppCheck } = await import('@/lib/firebase-admin');
  await getAdminAppCheck().verifyToken(token);
}

export async function checkAppCheck(
  request: NextRequest
): Promise<AppCheckResult> {
  const mode = getMode();
  if (mode === 'off') return 'off';

  const token = request.headers.get('x-firebase-appcheck');
  let result: AppCheckResult = 'missing';

  if (token) {
    try {
      await verifyAppCheckToken(token);
      return 'valid';
    } catch {
      result = 'invalid';
    }
  }

  if (mode === 'monitor') {
    console.warn(`[App Check] ${result} token for ${describeRequest(request)}`);
    return result;
  }

  throw createAppCheckError();
}
