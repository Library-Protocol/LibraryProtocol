import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {

    const { id: curatorId } = await context.params

    if (!curatorId) {
      return NextResponse.json({ error: 'Curator ID is required' }, { status: 400 });
    }

    // Fetch borrowings where at least one log has status "Preparing"
    const borrowings = await prisma.borrowings.findMany({
      where: {
        curatorId,
        logs: {
          some: {
            status: 'Preparing',
          },
        },
      },
      include: {
        logs: true,
        book: true,
      },
    });

    return NextResponse.json(borrowings, { status: 200 });
  } catch (error) {
    console.error('Error fetching lendings:', error);

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
