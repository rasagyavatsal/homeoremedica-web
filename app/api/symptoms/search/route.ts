import { NextRequest, NextResponse } from 'next/server';
import { searchSymptomsForApi } from '@/lib/server/repertory/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const book = searchParams.get('book');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], total: 0 });
    }

    if (!book) {
      return NextResponse.json({ error: 'Book is required' }, { status: 400 });
    }
    
    const response = await searchSymptomsForApi(book, query, limit, offset);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Symptom search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
