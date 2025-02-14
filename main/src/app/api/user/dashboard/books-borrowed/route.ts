import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const wallet = searchParams.get('wallet')

  console.log('Wallet Address', wallet)

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
  }

  try {

    const borrowings = await prisma.borrowings.findMany({
      where: { wallet: wallet },
      include: {
        book: true,
        logs: true,
      },
    })

    return NextResponse.json(borrowings)
  } catch (error) {
    console.error('Error fetching borrowings:', error)
    
return NextResponse.json(
      { error: 'Failed to fetch borrowings' },
      { status: 500 }
    )
  }
}


