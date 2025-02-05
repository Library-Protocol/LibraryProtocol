import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    const { id: curatorId } = context.params;

    const {
      wallet,
      bookId,
      name,
      email,
      phone,
      deliveryAddress,
      borrowDate,
      returnDate,
    } = await request.json();

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
      },
    });

    return NextResponse.json({ borrowing }, { status: 200 });

  } catch (error) {

    return NextResponse.json({ error: 'Failed to borrow book' }, { status: 500 });
  }
}
