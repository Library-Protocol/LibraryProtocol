import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {

    const curators = await prisma.curator.findMany({
      include: {
        books: {
          select: {
            id: true,
            title: true,
            onChainUniqueId: true,
            transactionHash: true,
            author: true,
            publisher: true,
            publishDate: true,
            pagination: true,
            additionalNotes: true,
            isbn: true,
            availability: true,
            image: false,
            curator: true,
            curatorId: true,
            createdAt: true,
            nftTokenId: true,
            borrowings: {
              select: {
                id: true
              }
            },
          }
        }
      }
    });

    return NextResponse.json(curators)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching curators' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
