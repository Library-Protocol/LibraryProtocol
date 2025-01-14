import { NextResponse } from 'next/server';

import { Resend } from 'resend';

import { SubscriptionTemplate } from '@/components/email/subscription';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {

  try {

    const { email } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'LibraryProtocol <subscription@libraryprotocol.xyz>',
      to: email,
      subject: 'Welcome to Library Protocol',
      react: SubscriptionTemplate({ email }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

