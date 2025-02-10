import { NextResponse } from 'next/server';

import { PrismaClient, BookRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {

    const { bookRequestId, curatorId, message, isApproved } = await request.json();

    if (!bookRequestId || !curatorId) {
      console.error('Missing required fields:', { bookRequestId, curatorId });

      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newStatus = isApproved ? BookRequestStatus.Approved : BookRequestStatus.Rejected;

    await prisma.bookRequests.update({
      where: { id: bookRequestId },
      data: { status: newStatus },
    });

    await prisma.bookRequestLogs.create({
      data: {
        bookRequestId,
        curatorId,
        status: newStatus,
        message: message || `Book request ${newStatus.toLowerCase()}`,
      },
    });

    return NextResponse.json({ message: 'Book request updated and log recorded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing book request:', error);

    return NextResponse.json({ error: 'Failed to process book request' }, { status: 500 });
  }
}
