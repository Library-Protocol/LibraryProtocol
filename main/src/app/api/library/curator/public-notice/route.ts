import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse request body
    const { publicNotice, curatorId } = await request.json();

    // Log the received data for debugging
    console.log('Received data:', { publicNotice, curatorId });

    // Validate input fields
    if (!curatorId || !publicNotice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the publicNotice for the curator in the database
    const updatedCurator = await prisma.curator.update({
      where: { id: curatorId },
      data: { publicNotice },
    });

    // Log the updated curator data for verification
    console.log('Updated Curator:', updatedCurator);

    return NextResponse.json(
      { message: 'Public notice updated successfully', curatorId: updatedCurator.id },
      { status: 200 }
    );
  } catch (error) {

    return NextResponse.json({ error: 'Error updating public notice' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
