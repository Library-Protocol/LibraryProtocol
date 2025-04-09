// src/app/api/user/onboarding/check-email/route.ts
import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, onboardingCompleted: true },
    });

    if (user) {
      return NextResponse.json({
        exists: true,
        onboardingCompleted: user.onboardingCompleted,
      }, { status: 200 });
    }

    return NextResponse.json({ exists: false }, { status: 200 });
  } catch (error) {
    console.error('Error checking email:', error);
    
return NextResponse.json({ error: 'Failed to check email' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
