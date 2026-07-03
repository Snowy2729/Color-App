import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

    const client = new ApifyClient({
      token: process.env.APIFY_API_KEY,
    });

    const { analysisId, seasonType } = await req.json();

    if (!analysisId || !seasonType) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    // 1. Veritabanında daha önce kaydedilmiş TikTok videoları var mı diye kontrol et
    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from('analyses')
      .select('tiktok_videos')
      .eq('id', analysisId)
      .single();

    // Eğer cache (önbellek) varsa, saniyeler beklemeden direkt onu döndür!
    if (analysis?.tiktok_videos && Array.isArray(analysis.tiktok_videos) && analysis.tiktok_videos.length > 0) {
      console.log('Returning cached TikTok videos for analysis:', analysisId);
      return NextResponse.json({ success: true, videos: analysis.tiktok_videos });
    }

    console.log('Fetching new TikTok videos from Apify...');

    // Arama sorgusu oluştur: Örn: "Deep Winter Outfits"
    const searchQuery = `${seasonType} outfits`;

    // Apify's clockworks/tiktok-scraper actor'ünü çağırıyoruz
    // Bu actor hızlı sonuç verir ve hashtag/search destekler.
    const run = await client.actor("clockworks/tiktok-scraper").call({
      resultsPerPage: 3,
      hashtags: [searchQuery.replace(/\s+/g, '')], // #DeepWinterOutfits formatında
      maxItems: 3,
      excludePinnedPosts: true,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false
    });

    // Sonuçları alıyoruz
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      // Eğer hashtag olarak bir şey bulamazsa kelime araması yapsın diyebiliriz ama
      // genelde tiktok scraper hashtag ile çalışır.
      return NextResponse.json({ success: true, videos: [] });
    }

    const videos = items.slice(0, 3).map((item: any) => ({
      id: item.id,
      text: item.text,
      coverUrl: item.videoMeta?.coverUrl || item.covers?.[0],
      webVideoUrl: item.webVideoUrl,
      authorMeta: item.authorMeta
    }));

    // 3. Apify'dan başarıyla çekilen videoları veritabanına kaydet (Cache'le)
    if (videos.length > 0) {
      await supabaseAdmin
        .from('analyses')
        .update({ tiktok_videos: videos })
        .eq('id', analysisId);
    }

    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    console.error('Apify TikTok Scraper Error:', error);
    return NextResponse.json({ error: 'TikTok verileri çekilemedi' }, { status: 500 });
  }
}
