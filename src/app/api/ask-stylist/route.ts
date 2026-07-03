import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { analysisId, colors } = await req.json();
    
    if (!analysisId || !colors || !Array.isArray(colors) || colors.length === 0 || colors.length > 3) {
      return NextResponse.json({ error: 'Lütfen 1 ile 3 arasında renk seçin' }, { status: 400 });
    }

    // Analiz detaylarını getir
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('season_type, undertone, contrast')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Analiz bulunamadı' }, { status: 404 });
    }

    const prompt = `Kullanıcının renk analizi profili:
- Mevsim Tipi: ${analysis.season_type}
- Cilt Alt Tonu: ${analysis.undertone}
- Kontrast Seviyesi: ${analysis.contrast}

ÖNEMLİ REFERANS (Mevsimlere Göre Kurallar):
- İlkbahar (Sıcak/Açık): Kaçınılması gerekenler: Saf siyah (#101010), Soğuk pastel (#E8D9E4). İdeal renkler: Mercan, Şeftali, Sıcak yeşil.
- Yaz (Soğuk/Açık): Kaçınılması gerekenler: Turuncu-sarı (#F2A623), Kiremit (#B5541F). İdeal renkler: Toz gülü, Mürdüm, Lavanta, Gri-mavi.
- Sonbahar (Sıcak/Koyu): Kaçınılması gerekenler: Saf beyaz (#F5F5F5), Soğuk pastel (#C9B8D8). İdeal renkler: Tuğla, Terracotta, Hardal, Zeytin yeşili.
- Kış (Soğuk/Koyu): Kaçınılması gerekenler: Bal rengi (#C98A3D), Hardal (#8A6D2F). İdeal renkler: Saf Siyah, Beyaz, Mavi tabanlı kırmızı, Zümrüt yeşili, Saf Gümüş.

Kullanıcı şu renklerin kendisine yakışıp yakışmadığını soruyor (HEX kodları):
${colors.join(', ')}

Lütfen bu renkleri yukarıdaki referans kurallarına ve kullanıcının profiline göre teker teker ve kombo olarak değerlendir. 
Özellikle "Kaçınılması gerekenler" listesindeki bir renge benziyorsa kesinlikle uyar ve o rengin değiştirilmesini söyle.
Eğer renklerden biri veya birkaçı bu mevsim tipine uygun değilse, onun yerine bu komboyu tamamlayacak daha uygun alternatif bir rengin HEX kodunu (referans kurallarından veya teoriden) öner.

Cevabını SADECE aşağıdaki JSON formatında ver, başka hiçbir kelime veya açıklama ekleme:
{
  "overallSuitability": boolean, // Genel olarak bu kombo yakışır mı? (true/false)
  "feedback": "Mevsim tipine göre bu renk kombinasyonunun neden yakıştığı veya yakışmadığı hakkında Türkçe detaylı ama kısa bir değerlendirme metni. Örneğin: 'Kırmızı ve siyah sana çok yakışıyor ancak seçtiğin sarı tonu seni soluk gösterebilir.'",
  "suggestions": [
    {
      "badColor": "#XXXXXX", // Değiştirilmesini önerdiğin rengin orijinal HEX kodu (uyumluysa boş bırakılabilir)
      "suggestedColor": "#YYYYYY", // Önerdiğin yeni rengin HEX kodu
      "reason": "Neden bu rengi önerdin? (Türkçe)"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4000,
      system: 'Sen uzman bir renk ve moda stil danışmanısın. İnsanlara dürüst, yapıcı ve bilimsel (mevsim analizine dayalı) stil tavsiyeleri verirsin.',
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude boş yanıt döndürdü');
    }

    let responseData;
    try {
      let rawText = textContent.text.trim();
      // JSON bloğunu metnin içinden regex ile ayıkla
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        rawText = match[0];
      }
      responseData = JSON.parse(rawText);
    } catch (e) {
      console.error('JSON parse error:', textContent.text);
      return NextResponse.json({ error: 'AI yanıtı işlenemedi' }, { status: 500 });
    }

    // Veritabanına kaydet
    const { error: insertError } = await supabaseAdmin
      .from('ai_stylist_queries')
      .insert({
        analysis_id: analysisId,
        colors: colors,
        overall_suitability: responseData.overallSuitability,
        feedback: responseData.feedback,
        suggestions: responseData.suggestions || []
      });

    if (insertError) {
      console.error('AI analizi kaydedilirken hata oluştu:', insertError);
    }

    return NextResponse.json({ success: true, result: responseData });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
