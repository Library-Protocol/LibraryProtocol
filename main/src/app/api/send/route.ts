import { SubscriptionTemplate } from '@/components/email/subscription';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  console.log('🔥 API Route triggered');
  try {
    const { email } = await request.json();
    console.log('📧 Received email:', email);

    const { data, error } = await resend.emails.send({
      from: 'LibraryProtocol <subscription@libraryprotocol.xyz>',
      to: email,
      subject: 'Welcome to Library Protocol',
      react: SubscriptionTemplate({ email }),
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log('✅ Email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
