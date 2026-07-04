import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
    );
    const resolvedParams = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysisId = resolvedParams.id;

    // Fetch the analysis first so we know the photo path
    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from('analyses')
      .select('photo_storage_path')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: 'Analysis not found or you are not allowed to delete it' }, { status: 404 });
    }

    // 1. Delete the photo from storage
    if (analysis.photo_storage_path) {
      await supabaseAdmin.storage
        .from('photos')
        .remove([analysis.photo_storage_path]);
    }

    // 2. Delete the analysis from the database (palettes cascade via ON DELETE CASCADE)
    const { error: deleteError } = await supabaseAdmin
      .from('analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
