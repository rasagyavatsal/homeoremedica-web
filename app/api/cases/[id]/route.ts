import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleApiError, validateCaseId } from '@/lib/server/api-helpers';
import { updateCase, deleteCase } from '@/lib/server/cases/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!validateCaseId(id)) {
      return NextResponse.json({
        code: 'INVALID_INPUT',
        message: 'Invalid case ID'
      }, { status: 400 });
    }

    const user = await requireAuth(request);
    const body = await request.json();
    const updated = await updateCase(user.uid, id, body);
    
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, 'Update case');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!validateCaseId(id)) {
      return NextResponse.json({
        code: 'INVALID_INPUT',
        message: 'Invalid case ID'
      }, { status: 400 });
    }

    const user = await requireAuth(request);
    await deleteCase(user.uid, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Delete case');
  }
}
