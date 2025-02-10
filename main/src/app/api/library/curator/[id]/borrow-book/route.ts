import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: curatorId } = await params;

    const {
      wallet,
      bookId,
      name,
      email,
      phone,
      deliveryAddress,
      borrowDate,
      returnDate,
      onChainBorrowingId,
    } = await request.json();

    console.log('API PAYLOAD',   wallet,
      bookId,
      name,
      email,
      phone,
      deliveryAddress,
      borrowDate,
      returnDate,
      onChainBorrowingId
    )

    // Validation
    if (!name || !email || !borrowDate || !returnDate || !bookId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a borrowing entry in the database
    const borrowing = await prisma.borrowings.create({
      data: {
        wallet,
        bookId,
        name,
        email,
        phone,
        deliveryAddress,
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
        curatorId,
        onChainBorrowingId,
      },
    });

    return NextResponse.json({ borrowing }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to borrow book' }, { status: 500 });
  }
}
