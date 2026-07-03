import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';



export async function POST(req: Request) {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
    );
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
    });

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { analysisId } = await req.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'Analiz ID eksik' }, { status: 400 });
    }

    // 1. Analizi veritabanından çek
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Analiz bulunamadı' }, { status: 404 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', analysis.user_id)
      .single();

    const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';

    // Eğer önceden üretilmiş paletler varsa onları döndür
    const { data: existingPalettes } = await supabase
      .from('palettes')
      .select('*')
      .eq('analysis_id', analysisId);

    if (existingPalettes && existingPalettes.length > 0) {
      return NextResponse.json({ success: true, analysis, palettes: existingPalettes, isSubscribed });
    }

    // 2. Claude'dan palet üretmesini iste
    const prompt = `Kullanıcının renk analizi sonuçları:
- Cilt alt tonu: ${analysis.undertone}
- Kontrast seviyesi: ${analysis.contrast}
- Mevsim tipi: ${analysis.season_type}

Lütfen bu özelliklere en uygun olan toplam 20 adet renk kodu (HEX formatında) üret. 
Kategoriler şu şekilde olmalı: 
- 10 adet "clothing" (kıyafet)
- 5 adet "makeup" (makyaj)
- 5 adet "hair" (saç boyası)

Cevabını SADECE aşağıdaki JSON formatında ver, başka hiçbir kelime ekleme:
[
  {"category": "clothing", "hex_code": "#XXXXXX", "color_name": "Renk Adı"},
  ...
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: 'Sen uzman bir renk ve stil danışmanısın. Kullanıcının mevsim tipine uygun muazzam uyumlu renk paletleri üreteceksin.',
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude boş yanıt döndürdü');
    }

    let paletteData;
    try {
      const rawText = textContent.text.replace(/```json/g, '').replace(/```/g, '').trim();
      paletteData = JSON.parse(rawText);
    } catch (e) {
      console.error('JSON parse error:', textContent.text);
      return NextResponse.json({ error: 'Palet üretilemedi' }, { status: 500 });
    }

    // 3. Veritabanına kaydet
    const palettesToInsert = paletteData.map((item: any) => ({
      analysis_id: analysisId,
      category: item.category,
      hex_code: item.hex_code,
      color_name: item.color_name
    }));

    const { data: insertedPalettes, error: insertError } = await supabaseAdmin
      .from('palettes')
      .insert(palettesToInsert)
      .select('*');

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Paletler kaydedilemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, palettes: insertedPalettes, analysis, isSubscribed });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
