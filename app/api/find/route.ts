import { NextRequest, NextResponse } from 'next/server';
import { checkAppCheck } from '@/lib/app-check/server';
import { handleApiError } from '@/lib/server/api-helpers';
import { findRemedySchema } from '@/lib/validation/schemas';
import { findRemedyResponseForApi } from '@/lib/server/repertory/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await checkAppCheck(request);
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
    return handleApiError(error, 'Find remedies');
  }
}
