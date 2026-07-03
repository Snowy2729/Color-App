import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';



// Admin client for bypassing RLS to read private storage
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

    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Dosya yolu eksik' }, { status: 400 });
    }

    // 1. Supabase Storage'dan dosyayı indir
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('photos')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      return NextResponse.json({ error: 'Fotoğraf okunamadı' }, { status: 500 });
    }

    // 2. Buffer'ı base64'e çevir
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    // Medya tipini bul
    const extension = filePath.split('.').pop()?.toLowerCase();
    const mediaType = extension === 'png' ? 'image/png' : 'image/jpeg';

    // 3. Claude API'sine gönder
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: 'Sen uzman bir kişisel renk analistisin. Kullanıcının yüzüne bakarak cilt alt tonunu (warm, cool, neutral), kontrastını (high, low) ve 12 mevsim tipinden hangisine ait olduğunu (ör. Deep Autumn, Light Spring) analiz et. SADECE geçerli bir JSON objesi döndür, başka hiçbir metin veya markdown (```json) ekleme.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as any,
                data: base64Image,
              }
            },
            {
              type: 'text',
              text: 'Bu fotoğrafı analiz et ve sadece şu formatta JSON döndür: {"undertone": "warm|cool|neutral", "contrast": "high|low", "season_type": "Mevsim Tipi"}'
            }
          ]
        }
      ]
    });

    // 4. JSON'ı parse et
    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude boş yanıt döndürdü');
    }

    let analysisResult;
    try {
      // Bazen Claude JSON'u tag'ler arasına alabilir diye temizliyoruz
      const rawText = textContent.text.replace(/```json/g, '').replace(/```/g, '').trim();
      analysisResult = JSON.parse(rawText);
    } catch (e) {
      console.error('JSON parse error:', textContent.text);
      return NextResponse.json({ error: 'Yapay zeka analiz sonucu anlaşılamadı' }, { status: 500 });
    }

    // 5. Analizi Veritabanına Kaydet
    const { data: dbResult, error: dbError } = await supabaseAdmin
      .from('analyses')
      .insert({
        user_id: user.id,
        photo_storage_path: filePath,
        season_type: analysisResult.season_type,
        undertone: analysisResult.undertone,
        contrast: analysisResult.contrast
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('DB Insert error:', dbError);
      return NextResponse.json({ error: 'Analiz kaydedilemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysisId: dbResult.id, result: analysisResult });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
