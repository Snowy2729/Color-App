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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId } = await req.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    // 1. Fetch the analysis from the database
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', analysis.user_id)
      .single();

    const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';

    // Return previously generated palettes if they exist
    const { data: existingPalettes } = await supabase
      .from('palettes')
      .select('*')
      .eq('analysis_id', analysisId);

    if (existingPalettes && existingPalettes.length > 0) {
      return NextResponse.json({ success: true, analysis, palettes: existingPalettes, isSubscribed });
    }

    // 2. Ask Claude to generate the palette
    const prompt = `The user's color analysis results:
- Skin undertone: ${analysis.undertone}
- Contrast level: ${analysis.contrast}
- Season type: ${analysis.season_type}

Please generate a total of 20 color codes (in HEX format) that best match these traits.
The categories must be:
- 10 "clothing" colors
- 5 "makeup" colors
- 5 "hair" (hair dye) colors

Respond ONLY with JSON in exactly this format, no other words:
[
  {"category": "clothing", "hex_code": "#XXXXXX", "color_name": "Color Name"},
  ...
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: 'You are an expert color and style consultant. You will generate beautifully harmonious color palettes that match the user\'s season type. All color names must be in English.',
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude returned an empty response');
    }

    let paletteData;
    try {
      const rawText = textContent.text.replace(/```json/g, '').replace(/```/g, '').trim();
      paletteData = JSON.parse(rawText);
    } catch (e) {
      console.error('JSON parse error:', textContent.text);
      return NextResponse.json({ error: 'Could not generate the palette' }, { status: 500 });
    }

    // 3. Save to the database
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
      return NextResponse.json({ error: 'Could not save the palettes' }, { status: 500 });
    }

    return NextResponse.json({ success: true, palettes: insertedPalettes, analysis, isSubscribed });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
