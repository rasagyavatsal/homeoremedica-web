import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/types/backend';

export function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as Partial<ApiError>;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}

export function getErrorStatus(error: ApiError): number {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      return 401;
    case 'NOT_FOUND':
      return 404;
    case 'INVALID_INPUT':
      return 400;
    default:
      return 500;
  }
}

export function handleApiError(error: unknown, context?: string) {
  if (context) {
    console.error(`[API Error] ${context}:`, error);
  } else {
    console.error('[API Error]:', error);
  }
  
  if (isApiError(error)) {
    return NextResponse.json(error, { status: getErrorStatus(error) });
  }
  
  return NextResponse.json({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error'
  }, { status: 500 });
}

export function validateCaseId(id: string | undefined | null): id is string {
  return typeof id === 'string' && id.trim() !== '';
}
