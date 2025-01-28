import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CuratorOnboardingPayload {
  wallet: string;
  name: string;
  country: string;
  city: string;
  state: string;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Validate request body
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      );
    }

    let parsedBody: CuratorOnboardingPayload;

    try {
      parsedBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON format', details: parseError instanceof Error ? parseError.message : 'JSON parsing failed' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { wallet, name, country, city, state } = parsedBody;

    const missingFields = [];
    if (!wallet) missingFields.push('wallet');
    if (!name) missingFields.push('name');
    if (!country) missingFields.push('country');
    if (!city) missingFields.push('city');
    if (!state) missingFields.push('state');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missingFields },
        { status: 400 }
      );
    }

    // Create curator in database
    const curator = await prisma.curator.create({
      data: {
        wallet,
        name,
        country,
        city,
        state,
      },
    });

    // Return success response with created curator data
    return NextResponse.json({
      success: true,
      data: curator,
    });

  } catch (error) {
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'A curator with this wallet address already exists',
            details: error.message
          },
          { status: 409 }
        );
      }
    }

    // Log the error for debugging
    console.error('Server Error:', error);

    // Return generic error response
    return NextResponse.json(
      {
        error: 'Failed to create curator',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  } finally {
    // Disconnect from Prisma client
    await prisma.$disconnect();
  }
}
