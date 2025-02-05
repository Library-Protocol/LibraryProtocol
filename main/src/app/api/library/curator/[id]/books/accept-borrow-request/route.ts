import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {

    const {
      wallet,
      bookId,
      borrowingId,
      note,
      curatorId,
      status, // Optional status field
    } = await request.json();

    if (!wallet || !borrowingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.borrowingLogs.create({
      data: {
        wallet,
        borrowingId,
        curatorId,
        message: note || 'Borrowing Request Accepted',
        status: status || 'Pending', // Default to 'pending' if not provided
      },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: { availability: false },
    });

    return NextResponse.json({ message: 'Borrowing request logged and book marked as unavailable' }, { status: 200 });

  } catch (error) {

    return NextResponse.json({ error: 'Failed to process borrow request' }, { status: 500 });
  }
}
