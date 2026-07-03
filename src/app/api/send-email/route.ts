import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend, alan adı doğrulanana kadar yalnızca hesap sahibinin adresine
// gönderime izin verir. vpxagent.com resend.com/domains adresinden
// doğrulandığında burayı ve `from` adresini güncelleyin.
const SUPPORT_INBOX = 'myusuforskiran@gmail.com';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');
    const { subject, text, html, replyTo } = await req.json();

    if (!subject || !(text || html)) {
      return NextResponse.json({ error: 'Konu ve mesaj gerekli' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Aura Analyzer <onboarding@resend.dev>',
      to: [SUPPORT_INBOX],
      ...(replyTo ? { replyTo } : {}),
      subject,
      text: text || '',
      ...(html ? { html } : {})
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message || 'E-posta gönderilemedi' }, { status: 502 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: any) {
    console.error('Resend Error:', error);
    return NextResponse.json({ error: error.message || 'E-posta gönderilemedi' }, { status: 500 });
  }
}
