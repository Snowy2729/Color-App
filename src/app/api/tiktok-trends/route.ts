import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Calls the Apify REST API directly with fetch — the apify-client package
// relies on Node's http stack and does not work on Cloudflare Workers.
const APIFY_ACTOR_URL =
  'https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
    );

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId, seasonType } = await req.json();

    if (!analysisId || !seasonType) {
      return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
    }

    // 1. Check if TikTok videos were previously saved in the database
    const { data: analysis } = await supabaseAdmin
      .from('analyses')
      .select('tiktok_videos')
      .eq('id', analysisId)
      .single();

    // If there is a cache, return it immediately without waiting!
    if (analysis?.tiktok_videos && Array.isArray(analysis.tiktok_videos) && analysis.tiktok_videos.length > 0) {
      console.log('Returning cached TikTok videos for analysis:', analysisId);
      return NextResponse.json({ success: true, videos: analysis.tiktok_videos });
    }

    if (!process.env.APIFY_API_KEY) {
      return NextResponse.json({ error: 'Apify is not configured' }, { status: 500 });
    }

    console.log('Fetching new TikTok videos from Apify...');

    // 2. Run the scraper synchronously and get the dataset items back.
    // A keyword search (e.g. "Cool Winter outfits") finds far more content
    // than an exact hashtag like #coolwinteroutfits.
    const searchQuery = `${seasonType} outfits`;

    const runRes = await fetch(
      `${APIFY_ACTOR_URL}?token=${process.env.APIFY_API_KEY}&timeout=90`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQueries: [searchQuery],
          resultsPerPage: 3,
          maxItems: 3,
          excludePinnedPosts: true,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }),
      }
    );

    if (!runRes.ok) {
      const errText = await runRes.text();
      console.error('Apify request failed:', runRes.status, errText.slice(0, 300));
      return NextResponse.json({ error: 'Could not fetch TikTok data' }, { status: 502 });
    }

    const items: any[] = await runRes.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, videos: [] });
    }

    const videos = items.slice(0, 3).map((item: any) => ({
      id: item.id,
      text: item.text,
      coverUrl: item.videoMeta?.coverUrl || item.covers?.[0],
      webVideoUrl: item.webVideoUrl,
      authorMeta: item.authorMeta ? { name: item.authorMeta.name } : undefined,
    })).filter(v => v.webVideoUrl);

    // 3. Cache the videos fetched from Apify in the database
    if (videos.length > 0) {
      await supabaseAdmin
        .from('analyses')
        .update({ tiktok_videos: videos })
        .eq('id', analysisId);
    }

    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    console.error('Apify TikTok Scraper Error:', error);
    return NextResponse.json({ error: 'Could not fetch TikTok data' }, { status: 500 });
  }
}
