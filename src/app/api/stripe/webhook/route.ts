import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase ortam degiskenleri eksik (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Hatası: ${error.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = await stripe.subscriptions.retrieve(session.subscription || session.id) as any;
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            stripe_price_id: subscription.items?.data?.[0]?.price?.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
          })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }
      
      case 'customer.subscription.deleted': {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            stripe_subscription_id: null,
            stripe_price_id: null
          })
          .eq('stripe_customer_id', session.customer);
        break;
      }
    }
  } catch (error) {
    console.error('Webhook isleme hatasi:', error);
    return NextResponse.json({ error: 'Veritabanı güncellenemedi' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
