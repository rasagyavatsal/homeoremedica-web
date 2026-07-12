import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createOrUpdateUser } from '@/lib/services/user-service';
import { ApiError } from '@/lib/types/backend';

export const dynamic = 'force-dynamic';

function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}

function getErrorDetails(error: unknown) {
  return {
    type: typeof error,
    hasCode: isApiError(error),
    code: isApiError(error) ? error.code : 'no code',
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : 'no stack'
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json().catch(() => ({}));
    const name = body.name;
    
    // Create or update user in Firestore
    await createOrUpdateUser(user.uid, user.email, name);
    
    // App is free for all users
    const response = {
      user: {
        uid: user.uid,
        email: user.email
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Session error:', error);
    console.error('Session error details:', getErrorDetails(error));
    
    if (isApiError(error)) {
      return NextResponse.json(error, { 
        status: error.code === 'AUTH_REQUIRED' ? 401 : 500 
      });
    }
    
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: getErrorMessage(error)
    }, { status: 500 });
  }
}
