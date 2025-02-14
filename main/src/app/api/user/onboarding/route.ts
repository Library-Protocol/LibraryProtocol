import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SocialMediaInput {
  platform: string
  handle: string
}

// Utility function to format platform names correctly
const formatPlatform = (platform: string) => {
  const formatted = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()

  return formatted === 'Linkedin' ? 'LinkedIn' : formatted // Special fix for LinkedIn capitalization
}

export async function POST(request: Request) {
  try {
    const {
      profileImage,
      wallet,
      name,
      email,
      bio,
      country,
      city,
      state,
      interests = [],
      socialMedia = []
    } = await request.json()

    console.log('Avatar:', profileImage)
    console.log('Wallet:', wallet)
    console.log('Name:', name)
    console.log('Email:', email)
    console.log('Bio:', bio)
    console.log('Country:', country)
    console.log('City:', city)
    console.log('State:', state)
    console.log('Interests:', interests)
    console.log('SocialMedia:', socialMedia)

    if (!wallet || !name) {
      return NextResponse.json({ error: 'Wallet and name are required' }, { status: 400 })
    }

    // Upsert user (create if not exists, update if exists)
    const user = await prisma.user.upsert({
      where: { wallet },
      update: {
        name,
        email,
        bio,
        profileImage,
        country,
        city,
        state
      },
      create: {
        wallet,
        name,
        email,
        bio,
        profileImage,
        country,
        city,
        state
      }
    })

    // Update Interests (if provided)
    if (interests.length > 0) {
      await prisma.interest.deleteMany({ where: { userId: user.id } })
      await prisma.interest.createMany({
        data: interests.map((name: string) => ({
          name,
          userId: user.id
        }))
      })
    }

    // Update Social Media (fixing enum matching issue)
    if (socialMedia.length > 0) {
      const validSocialMedia = socialMedia
        .filter((social: SocialMediaInput) => social.handle.trim() !== '') // Ignore empty handles
        .map((social: SocialMediaInput) => ({
          platform: formatPlatform(social.platform), // Fix platform name to match Prisma enum
          handle: social.handle.trim(),
          userId: user.id
        }))

      if (validSocialMedia.length > 0) {
        await prisma.$transaction([
          prisma.socialLink.deleteMany({ where: { userId: user.id } }),
          prisma.socialLink.createMany({ data: validSocialMedia })
        ])
      }
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error in onboarding:', error)

    return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 })
  }
}
