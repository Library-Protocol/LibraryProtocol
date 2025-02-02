import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request ) {
  try {
    const { title, author, additionalNotes, isbn, publisher, publishDate, pagination, curatorId } = await request.json();

    console.log('Received Data:', { title, author, isbn, publisher, publishDate, pagination, curatorId });

    if (!curatorId) {
      return NextResponse.json({ error: 'Curator ID is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const bookRequest = await prisma.book.create({
      data: {
        title,
        author,
        additionalNotes,
        isbn,
        publisher,
        pagination,
        publishDate,
        curatorId,
      },
    });

    return NextResponse.json(bookRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error adding book' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
