import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, subject, text, html } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gerekli' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Aura Analyzer <onboarding@resend.dev>',
      to: [email],
      subject: subject || 'Aura Analyzer\'dan Merhaba!',
      text: text || 'Aura Analyzer sistemine hoş geldiniz.',
      html: html || '<p>Aura Analyzer sistemine hoş geldiniz.</p>'
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Resend Error:', error);
    return NextResponse.json({ error: error.message || 'E-posta gönderilemedi' }, { status: 500 });
  }
}
