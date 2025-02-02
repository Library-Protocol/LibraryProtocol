// src/app/api/library/curator/[id]/fetch-details/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {

    const { id: walletAddress } = await context.params

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const curator = await prisma.curator.findUnique({
      where: { wallet: walletAddress },
    });

    if (!curator) {
      return NextResponse.json({ error: 'Curator not found' }, { status: 404 });
    }

    return NextResponse.json({ id: curator.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch curator data' }, { status: 500 });
  }
}
