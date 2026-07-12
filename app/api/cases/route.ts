import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/server/api-helpers';
import { listCases, createCase } from '@/lib/server/cases/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const cases = await listCases(user.uid);
    return NextResponse.json({ cases });
  } catch (error) {
    return handleApiError(error, 'Get cases');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const newCase = await createCase(user.uid, body);
    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'Create case');
  }
}
