import { NextResponse } from 'next/server';
import { Polar } from '@polar-sh/sdk';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const url = new URL(req.url);
    const plan = url.searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly';
    const productId = plan === 'yearly'
      ? process.env.POLAR_PRODUCT_YEARLY
      : process.env.POLAR_PRODUCT_MONTHLY;
    const accessToken = process.env.POLAR_ACCESS_TOKEN;

    if (!productId || !accessToken) {
      return NextResponse.json({ error: 'Ödeme ayarları yapılandırılmamış' }, { status: 500 });
    }

    const polar = new Polar({
      accessToken,
      server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${appUrl}/dashboard/pricing?checkout=success`,
      externalCustomerId: user.id,
      customerEmail: user.email,
      metadata: { userId: user.id },
    });

    return NextResponse.redirect(checkout.url);
  } catch (error: any) {
    console.error('Polar Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Ödeme sayfası oluşturulamadı' }, { status: 500 });
  }
}
