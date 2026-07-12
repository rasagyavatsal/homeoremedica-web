import { NextRequest, NextResponse } from 'next/server';
import { searchRemediesForApi } from '@/lib/server/repertory/service';

export async function POST(req: NextRequest) {
  try {
    const { symptoms, book } = await req.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json([]);
    }

    if (!book) {
      return NextResponse.json({ error: 'Book is required' }, { status: 400 });
    }
    
    const searchResults = await searchRemediesForApi(book, symptoms);

    return NextResponse.json(searchResults);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
