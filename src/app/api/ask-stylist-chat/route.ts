import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { formatSeasonReference } from '@/lib/color-analysis';

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

    const { analysisId, query } = await req.json();

    if (!analysisId || !query || query.trim() === '') {
      return NextResponse.json({ error: 'Please ask a question.' }, { status: 400 });
    }

    // Fetch the analysis details
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('season_type, undertone, contrast')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const systemPrompt = `You are Aura Photo Booth's expert color and fashion style consultant. You give people honest, constructive and scientific (seasonal-analysis-based) style advice.
USER PROFILE:
- Season Type: ${analysis.season_type}
- Skin Undertone: ${analysis.undertone}
- Contrast Level: ${analysis.contrast}

IMPORTANT REFERENCE:
${formatSeasonReference(analysis.season_type)}

VERY IMPORTANT RULE:
If the user asks about anything UNRELATED to clothing, outfits, colors, style, fashion or makeup shades (for example politics, software, medicine, daily news, etc.), DO NOT answer it. Politely decline in a fun tone, for example: "Sorry, I'm a style consultant. I can only answer questions about fashion, your color palette and your style 👗✨". Never engage with non-fashion topics.

Answer the user's question directly and concisely (3-4 sentences max). Make recommendations that fit their profile. Reply in the same language the user writes in; default to English. Never use markdown formatting (JSON etc.) — write plain text.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude returned an empty response');
    }

    // Could be logged to the DB later; for now return directly

    return NextResponse.json({ success: true, reply: textContent.text });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
