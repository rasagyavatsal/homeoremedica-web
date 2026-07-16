import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { ApiError } from '@/lib/types/backend';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    uid: string;
    email: string;
  };
}

export async function verifyAuthToken(request: NextRequest): Promise<{ uid: string; email: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  const adminAuth = getAdminAuth();

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || ''
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export function createAuthError(): ApiError {
  return {
    code: 'AUTH_REQUIRED',
    message: 'Authentication required. Please provide a valid Firebase ID token.'
  };
}

export async function requireAuth(request: NextRequest): Promise<{ uid: string; email: string }> {
  const user = await verifyAuthToken(request);
  if (!user) {
    throw createAuthError();
  }
  
  return user;
}
