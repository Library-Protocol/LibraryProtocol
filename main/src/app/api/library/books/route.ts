import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        curator: true,
      }
    })

    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching curators' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
