import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: curatorId } = await context.params;

    if (!curatorId) {
      return NextResponse.json({ error: 'Curator ID is required' }, { status: 400 });
    }

    // Fetch borrowings where curatorId matches
    const borrowings = await prisma.borrowings.findMany({
      where: { curatorId },
      include: {
        book: true, // Include book details
        logs: true, // Include borrowing logs
      },
    });

    if (borrowings.length === 0) {
      return NextResponse.json({ message: 'No borrowings found for this curator' }, { status: 404 });
    }

    return NextResponse.json({ borrowings }, { status: 200 });

  } catch (error) {

    return NextResponse.json({ error: 'Failed to fetch borrowings' }, { status: 500 });
  }
}
