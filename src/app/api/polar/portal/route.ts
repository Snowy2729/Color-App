import { CustomerPortal } from '@polar-sh/nextjs';
import { createClient } from '@/lib/supabase/server';

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
  server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
  getExternalCustomerId: async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Oturum bulunamadı');
    }
    return user.id;
  },
});
