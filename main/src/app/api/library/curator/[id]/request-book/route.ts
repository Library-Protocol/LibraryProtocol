import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request ) {
  try {
    const { isbn, title, author, additionalNotes, curatorId, wallet, transactionHash, onChainBookRequestId } = await request.json();

    if (!curatorId) {
      return NextResponse.json({ error: 'Curator ID is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const curator = await prisma.curator.findUnique({
      where: { id: curatorId },
    });

    if (!curator) {
      return NextResponse.json({ error: 'Curator not found' }, { status: 404 });
    }

    const bookRequest = await prisma.bookRequests.create({
      data: {
        wallet,
        isbn,
        title,
        author,
        additionalNotes,
        curatorId,
        transactionHash,
        onChainBookRequestId
      }
    });

    return NextResponse.json(bookRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating book request' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
