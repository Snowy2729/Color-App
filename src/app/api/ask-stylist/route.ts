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

    const { analysisId, colors } = await req.json();

    if (!analysisId || !colors || !Array.isArray(colors) || colors.length === 0 || colors.length > 3) {
      return NextResponse.json({ error: 'Please pick between 1 and 3 colors' }, { status: 400 });
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

    const prompt = `The user's color analysis profile:
- Season Type: ${analysis.season_type}
- Skin Undertone: ${analysis.undertone}
- Contrast Level: ${analysis.contrast}

IMPORTANT REFERENCE:
${formatSeasonReference(analysis.season_type)}

The user is asking whether these colors suit them (HEX codes):
${colors.join(', ')}

Please evaluate these colors one by one and as a combo, based on the reference rules above and the user's profile.
If a color resembles one on the "Avoid" list, make sure to warn about it and say it should be replaced.
If one or more colors don't fit this season type, suggest a better alternative HEX code (from the reference rules or color theory) that completes the combo.

Respond ONLY with JSON in exactly this format, no other words or explanations:
{
  "overallSuitability": boolean, // Does this combo generally suit them? (true/false)
  "feedback": "A detailed but concise assessment in English of why this color combination does or doesn't suit them based on their season type. For example: 'Red and black look great on you, but the yellow shade you picked may wash you out.'",
  "suggestions": [
    {
      "badColor": "#XXXXXX", // The original HEX code of the color you suggest replacing (can be empty if it's fine)
      "suggestedColor": "#YYYYYY", // The HEX code of the new color you suggest
      "reason": "Why did you suggest this color? (in English)"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4000,
      system: 'You are an expert color and fashion style consultant. You give people honest, constructive and scientific (seasonal-analysis-based) style advice.',
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude returned an empty response');
    }

    let responseData;
    try {
      let rawText = textContent.text.trim();
      // Extract the JSON block from the text with a regex
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        rawText = match[0];
      }
      responseData = JSON.parse(rawText);
    } catch (e) {
      console.error('JSON parse error:', textContent.text);
      return NextResponse.json({ error: 'Could not process the AI response' }, { status: 500 });
    }

    // Save to the database
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
      console.error('Error while saving the AI analysis:', insertError);
    }

    return NextResponse.json({ success: true, result: responseData });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
