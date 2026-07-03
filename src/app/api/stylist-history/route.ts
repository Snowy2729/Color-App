import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { analysisId } = await req.json();
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Analiz ID eksik' }, { status: 400 });
    }

    // Kullanıcının analize sahip olup olmadığını ve geçmişi getir
    const { data: queries, error } = await supabase
      .from('ai_stylist_queries')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json({ error: 'Geçmiş analizler getirilemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, history: queries || [] });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
