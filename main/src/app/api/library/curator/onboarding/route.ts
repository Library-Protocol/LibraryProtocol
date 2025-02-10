import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { wallet, name, country, city, state, coverImage, transactionHash, onChainUniqueId } = await request.json();

    if (!coverImage) {
      return NextResponse.json({ error: 'Cover image is required' }, { status: 400 });
    }

    // Generate the filename from the name
    const fileName = name.replace(/\s+/g, '_').toLowerCase() + '.png'; // Replace spaces with underscores and convert to lowercase

    const base64Data = coverImage.replace(/^data:image\/\w+;base64,/, ''); // Remove base64 metadata
    const buffer = Buffer.from(base64Data, 'base64'); // Convert to buffer
    const blob = new Blob([buffer], { type: 'image/png' });
    const file = new File([blob], fileName, { type: 'image/png' });

    const data = new FormData();

    data.append('file', file);

    const upload = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
         Authorization: `Bearer ${process.env.PINATA_JWT}`
      },
      body: data,
    });

    const uploadRes = await upload.json();

    if (!uploadRes || !uploadRes.IpfsHash) {
      return NextResponse.json({ error: 'Failed to upload image to Pinata' }, { status: 500 });
    }

    const imageUrl = `${uploadRes.IpfsHash}`;

    const curator = await prisma.curator.create({
      data: {
        name,
        country,
        city,
        state,
        wallet: wallet,
        coverImage: imageUrl,
        transactionHash,
        onChainUniqueId
      },
    });

    return NextResponse.json({ success: true, curator });
  } catch (error) {
    console.error('Error in onboarding:', error);

    return NextResponse.json(
      { error: 'Failed to create library' },
      { status: 500 }
    );
  }
}
