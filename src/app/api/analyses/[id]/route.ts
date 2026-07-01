import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const analysisId = resolvedParams.id;

    // Önce analizi çekelim ki fotoğraf yolunu bilelim
    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from('analyses')
      .select('photo_storage_path')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: 'Analiz bulunamadı veya silme yetkiniz yok' }, { status: 404 });
    }

    // 1. Storage'dan Fotoğrafı Sil
    if (analysis.photo_storage_path) {
      await supabaseAdmin.storage
        .from('photos')
        .remove([analysis.photo_storage_path]);
    }

    // 2. Veritabanından Analizi Sil (ON DELETE CASCADE olduğu için palette'ler de otomatik silinir)
    const { error: deleteError } = await supabaseAdmin
      .from('analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Silme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
