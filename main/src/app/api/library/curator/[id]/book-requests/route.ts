import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: curatorId } = await context.params;

    if (!curatorId) {
      return NextResponse.json({ error: 'Curator ID is required' }, { status: 400 });
    }

    // Fetch book requests where curatorId matches
    const bookRequests = await prisma.bookRequests.findMany({
      where: { curatorId },
      include: {
        logs: true,
      },
    });

    return NextResponse.json({ bookRequests }, { status: 200 });

  } catch (error) {

    return NextResponse.json({ error: 'Failed to fetch book requests' }, { status: 500 });
  }
}
