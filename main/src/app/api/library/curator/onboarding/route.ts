// pages/api/library/curator/onboarding.ts
import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { wallet, name, country, city, state, coverImage, transactionHash, onChainUniqueId, nftTokenId } =
            await request.json();

        if (!wallet || !name || !country || !city || !state || !coverImage || !transactionHash || !onChainUniqueId || !nftTokenId) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const curator = await prisma.curator.create({
            data: {
                name,
                country,
                city,
                state,
                wallet,
                coverImage,
                transactionHash,
                onChainUniqueId,
                nftTokenId,
                user: {
                    connect: {
                        wallet,
                    },
                },
            },
        });

        return NextResponse.json({ success: true, curator });
    } catch (error) {
        console.error('Error in onboarding:', error);
        
return NextResponse.json(
            { error: `Failed to create library: ${(error as Error).message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
