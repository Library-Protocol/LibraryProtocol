import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the curatorId
    const { id: curatorId } = await params;

    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get('isbn');

    if (!curatorId || !isbn) {
      return NextResponse.json(
        { error: 'Both curatorId and isbn are required' },
        { status: 400 }
      );
    }

    // Build search conditions dynamically
    const whereClause: any = { curatorId: curatorId };

    if (isbn) whereClause.isbn = isbn;

    // Fetch books based on the conditions
    const books = await prisma.book.findMany({ where: whereClause });

    if (books.length === 0) {
      return NextResponse.json(
        { message: 'No books found matching the criteria' },
        { status: 404 }
      );
    }

    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
