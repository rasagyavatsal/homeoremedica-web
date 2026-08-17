import { NextRequest, NextResponse } from 'next/server';
import { checkAppCheck } from '@/lib/app-check/server';
import { handleApiError } from '@/lib/server/api-helpers';
import { sendChatMessage } from '@/lib/server/chat-service';
import { chatRequestSchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await checkAppCheck(request);
    const body = await request.json();

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        code: 'INVALID_INPUT',
        message: 'Invalid request data',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    const response = await sendChatMessage(validationResult.data);

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, 'Chat');
  }
}
