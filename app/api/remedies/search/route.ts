import { NextRequest, NextResponse } from 'next/server';
import { checkAppCheck } from '@/lib/app-check/server';
import { isSearchBookId } from '@/lib/seo/book-data';
import { getErrorStatus, isApiError } from '@/lib/server/api-helpers';
import { searchRemediesForApi } from '@/lib/server/repertory/service';

export async function POST(req: NextRequest) {
  try {
    await checkAppCheck(req);
    const { symptoms, book } = await req.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json([]);
    }

    if (!book) {
      return NextResponse.json({ error: 'Book is required' }, { status: 400 });
    }

    if (!isSearchBookId(book)) {
      return NextResponse.json({ error: 'Invalid book' }, { status: 400 });
    }
    
    const searchResults = await searchRemediesForApi(book, symptoms);

    return NextResponse.json(searchResults);
  } catch (error: any) {
    console.error('Search API error:', error);
    if (isApiError(error)) {
      return NextResponse.json(error, { status: getErrorStatus(error) });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
