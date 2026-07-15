import { NextRequest, NextResponse } from 'next/server';
import { findRemedySchema } from '@/lib/validation/schemas';
import { ApiError } from '@/lib/types/backend';
import { findRemedyResponseForApi } from '@/lib/server/repertory/service';

export const dynamic = 'force-dynamic';

function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
  );
}

function getErrorStatus(error: ApiError) {
  if (error.code === 'AUTH_REQUIRED') {
    return 401;
  }

  if (error.code === 'INVALID_INPUT') {
    return 400;
  }

  return 500;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = findRemedySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        code: 'INVALID_INPUT',
        message: 'Invalid request data',
        details: validationResult.error.issues
      }, { status: 400 });
    }
    
    const { bookId, symptoms } = validationResult.data;
    
    const response = await findRemedyResponseForApi(bookId, symptoms);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Find remedies error:', error);
    
    if (isApiError(error)) {
      return NextResponse.json(error, { status: getErrorStatus(error) });
    }
    
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, { status: 500 });
  }
}
