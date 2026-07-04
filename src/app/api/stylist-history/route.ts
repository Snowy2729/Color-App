import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId } = await req.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    // Verify ownership of the analysis and fetch the history
    const { data: queries, error } = await supabase
      .from('ai_stylist_queries')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json({ error: 'Could not fetch past checks' }, { status: 500 });
    }

    return NextResponse.json({ success: true, history: queries || [] });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
