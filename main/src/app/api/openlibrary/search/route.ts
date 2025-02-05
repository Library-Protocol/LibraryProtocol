import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return NextResponse.json({ error: 'ISBN is required' }, { status: 400 });
  }

  try {
    // Fetch book data from OpenLibrary API
    const response = await fetch(`https://openlibrary.org/api/volumes/brief/isbn/${isbn}.json`);

    if (!response.ok) {
      throw new Error('Failed to fetch book data');
    }

    const data = await response.json();

    // Extract the book records
    const records = data.records;

    if (!records || Object.keys(records).length === 0) {

      return NextResponse.json({ error: 'No book found with this ISBN' }, { status: 404 });
    }

    const firstRecord = Object.values(records)[0] as any; // Extract first book entry
    const bookData = firstRecord?.data;

    if (!bookData) {
      return NextResponse.json({ error: 'No book data found' }, { status: 404 });
    }

    // Return structured book data
    return NextResponse.json({
      title: bookData.title,
      authors: bookData.authors?.map((author: any) => author.name).join(', '),
      publisher: bookData.publishers?.map((publisher: any) => publisher.name).join(', '),
      publishDate: bookData.publish_date,
      pagination: bookData.pagination ?? bookData.number_of_pages,
      coverUrl: bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small,
      openLibraryUrl: bookData.url,
      isbn_13: bookData.identifiers?.isbn_13?.[0] || isbn,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch book data' }, { status: 500 });
  }
}
