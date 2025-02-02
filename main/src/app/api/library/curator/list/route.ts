import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const curators = await prisma.curator.findMany({
      include: {
        books: true, // Optionally, include books curated by the curator
      }
    })
    return NextResponse.json(curators)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching curators' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
