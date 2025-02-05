import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object
    const { id: curatorId } = await context.params

    if (!curatorId) {
      return NextResponse.json({ error: 'Curator ID is required' }, { status: 400 })
    }

    const curator = await prisma.curator.findUnique({
      where: { id: curatorId },
      include: {
        books: true,
      },
    })

    if (!curator) {
      return NextResponse.json({ error: 'Curator not found' }, { status: 404 })
    }

    return NextResponse.json(curator)
  } catch (error) {

    return NextResponse.json({ error: 'Error fetching curator' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
