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

    const { analysisId, query } = await req.json();
    
    if (!analysisId || !query || query.trim() === '') {
      return NextResponse.json({ error: 'Lütfen bir soru sorun.' }, { status: 400 });
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

    const systemPrompt = `Sen Aura Analyzer'ın uzman bir renk ve moda stil danışmanısın. İnsanlara dürüst, yapıcı ve bilimsel (mevsim analizine dayalı) stil tavsiyeleri verirsin.
KULLANICI PROFİLİ:
- Mevsim Tipi: ${analysis.season_type}
- Cilt Alt Tonu: ${analysis.undertone}
- Kontrast Seviyesi: ${analysis.contrast}

ÖNEMLİ REFERANS (Mevsimlere Göre Kurallar):
- İlkbahar: Kaçınılması gerekenler: Saf siyah, Soğuk pastel. İdeal: Mercan, Şeftali, Sıcak yeşil.
- Yaz: Kaçınılması gerekenler: Turuncu-sarı, Kiremit. İdeal: Toz gülü, Mürdüm, Lavanta, Gri-mavi.
- Sonbahar: Kaçınılması gerekenler: Saf beyaz, Soğuk pastel. İdeal: Tuğla, Terracotta, Hardal, Zeytin yeşili.
- Kış: Kaçınılması gerekenler: Bal rengi, Hardal. İdeal: Saf Siyah, Beyaz, Mavi tabanlı kırmızı, Zümrüt yeşili, Saf Gümüş.

ÇOK ÖNEMLİ KURAL: 
Kullanıcı kıyafet, kombin, renk, stil, giyim veya makyaj tonları HARİCİNDE (örneğin siyaset, yazılım, tıp, günlük haberler vb.) alakalı olmayan bir soru sorarsa KESİNLİKLE CEVAP VERME. Sadece "Üzgünüm, ben bir stil danışmanıyım. Sadece moda, renk paletiniz ve stiliniz hakkında soruları cevaplayabilirim 👗✨" gibi kibar ve eğlenceli bir üslupla reddet. Moda dışı bir konuya asla girme.

Kullanıcının sorusuna doğrudan, kısa ve öz (maksimum 3-4 cümle) cevap ver. Kullanıcının profiline uygun önerilerde bulun. Asla markdown kullanma (kalın yazı vs. olabilir ama JSON vs formatlama), doğrudan normal metin olarak yaz.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude boş yanıt döndürdü');
    }

    // İsterseniz loglamak için DB'ye kaydedilebilir ama şu anlık doğrudan dönelim
    
    return NextResponse.json({ success: true, reply: textContent.text });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
