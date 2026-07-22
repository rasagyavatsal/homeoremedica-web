import { NextRequest, NextResponse } from 'next/server';
import { checkAppCheck } from '@/lib/app-check/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/server/api-helpers';
import { createOrUpdateUser } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await checkAppCheck(request);
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
    return handleApiError(error, 'Session');
  }
}
