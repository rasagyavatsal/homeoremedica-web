import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    // Test Firebase Admin connection
    const testUser = await getAdminAuth().listUsers(1);
    
    // Test Firestore connection
    await getAdminDb().collection('test').doc('connection').get();
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful',
      details: {
        auth: 'Connected',
        firestore: 'Connected',
        userCount: testUser.users.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Firebase connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Firebase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
