import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/types/backend';
import { ZodError } from 'zod';

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  // Handle known API errors
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError;
    const statusCode = getStatusCodeForError(apiError.code);
    return NextResponse.json(apiError, { status: statusCode });
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const apiError: ApiError = {
      code: 'INVALID_INPUT',
      message: 'Invalid request data',
      details: error.issues
    };
    return NextResponse.json(apiError, { status: 400 });
  }
  
  // Handle generic errors
  const genericError: ApiError = {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error'
  };
  
  return NextResponse.json(genericError, { status: 500 });
}

function getStatusCodeForError(code: ApiError['code']): number {
  switch (code) {
    case 'AUTH_REQUIRED':
      return 401;
    case 'INVALID_INPUT':
      return 400;
    case 'NOT_FOUND':
      return 404;
    case 'INTERNAL_ERROR':
    default:
      return 500;
  }
}

export function createApiError(
  code: ApiError['code'],
  message: string,
  details?: any
): ApiError {
  return { code, message, details };
}
