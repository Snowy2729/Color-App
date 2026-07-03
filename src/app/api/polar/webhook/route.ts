import { Webhooks } from '@polar-sh/nextjs';
import { createClient } from '@supabase/supabase-js';

async function syncSubscription(subscription: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase ortam degiskenleri eksik, webhook islenemedi');
    return;
  }

  const userId = subscription.metadata?.userId
    ? String(subscription.metadata.userId)
    : subscription.customer?.externalId;

  if (!userId) {
    console.error('Polar webhook: kullanıcı eşleşmesi bulunamadı', subscription.id);
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      polar_subscription_id: subscription.id,
      polar_product_id: subscription.productId,
      status: subscription.status,
      current_period_end: subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toISOString()
        : null,
      trial_ends_at: subscription.trialEnd
        ? new Date(subscription.trialEnd).toISOString()
        : null,
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Polar webhook Supabase hatası:', error);
  }
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || '',
  onSubscriptionCreated: async (payload) => {
    await syncSubscription(payload.data);
  },
  onSubscriptionUpdated: async (payload) => {
    await syncSubscription(payload.data);
  },
});
