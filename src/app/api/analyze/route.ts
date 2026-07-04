import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_PROMPT, getSeasonProfile } from '@/lib/color-analysis';



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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
    }

    // 1. Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('photos')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      return NextResponse.json({ error: 'Could not read the photo' }, { status: 500 });
    }

    // 2. Convert the buffer to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Detect the media type
    const extension = filePath.split('.').pop()?.toLowerCase();
    const mediaType = extension === 'png' ? 'image/png' : 'image/jpeg';

    // 3. Send to the Claude API with the full 12-season methodology
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2000,
      system: ANALYSIS_SYSTEM_PROMPT,
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
              text: ANALYSIS_USER_PROMPT
            }
          ]
        }
      ]
    });

    // 4. Parse the JSON
    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Claude returned an empty response');
    }

    let analysisResult;
    try {
      // Strip markdown fences in case Claude wraps the JSON
      let rawText = textContent.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) rawText = match[0];
      analysisResult = JSON.parse(rawText);
    } catch (e) {
      console.error('JSON parse error:', textContent.text);
      return NextResponse.json({ error: 'Could not understand the AI analysis result' }, { status: 500 });
    }

    // Normalize the season to a canonical name from the knowledge base
    const profile = getSeasonProfile(analysisResult.season_type);
    const seasonType = profile?.name || analysisResult.season_type;

    // 5. Save the analysis to the database (details column is optional,
    // fall back to the base columns if the migration hasn't run yet)
    const baseRow = {
      user_id: user.id,
      photo_storage_path: filePath,
      season_type: seasonType,
      undertone: analysisResult.undertone,
      contrast: analysisResult.contrast
    };

    let dbResult = null;
    let dbError = null;
    ({ data: dbResult, error: dbError } = await supabaseAdmin
      .from('analyses')
      .insert({ ...baseRow, details: analysisResult })
      .select('id')
      .single());

    if (dbError) {
      ({ data: dbResult, error: dbError } = await supabaseAdmin
        .from('analyses')
        .insert(baseRow)
        .select('id')
        .single());
    }

    if (dbError || !dbResult) {
      console.error('DB Insert error:', dbError);
      return NextResponse.json({ error: 'Could not save the analysis' }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysisId: dbResult.id, result: analysisResult });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
