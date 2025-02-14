import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get('wallet');

  console.log('Wallet Address:', wallet);

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        curator: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);

return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
