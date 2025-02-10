import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { title, author, publisher, publishDate, pagination, additionalNotes, isbn, image, curatorId, onChainUniqueId, transactionHash } = await request.json();

    if (!curatorId || !title || !author || !isbn || !publisher || !publishDate || !pagination) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        publisher,
        publishDate,
        pagination: Number(pagination),
        additionalNotes,
        isbn,
        image,
        curatorId,
        onChainUniqueId,
        transactionHash
      },
    });

    return NextResponse.json({ message: 'Book added successfully', bookId: newBook.id }, { status: 201 });
  } catch (error) {
    console.error('Error adding book:', error);

    return NextResponse.json({ error: 'Error adding book' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
