import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, Image as ImageIcon, ChevronRight } from 'lucide-react';
import DeleteButton from './DeleteButton';

export default async function HistoryPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  const { data: analyses, error: fetchError } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('Error fetching analyses:', fetchError);
  }

  // Fotoğrafların signed URL'lerini al
  const analysesWithUrls = await Promise.all(
    (analyses || []).map(async (analysis) => {
      const { data } = await supabase.storage
        .from('photos')
        .createSignedUrl(analysis.photo_storage_path, 3600);
        
      return {
        ...analysis,
        photoUrl: data?.signedUrl || null
      };
    })
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-serif text-white mb-2">Geçmiş Analizlerim</h1>
        <p className="text-zinc-400">Önceden yaptığınız tüm renk ve mevsim analizleriniz burada listelenir.</p>
      </div>

      {analysesWithUrls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-white/10 rounded-3xl bg-white/5">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Henüz analiz bulunmuyor</h3>
          <p className="text-zinc-400 text-center max-w-sm mb-6">
            Yapay zeka ile kişisel renk analizinizi yapmak için yeni bir fotoğraf yükleyin.
          </p>
          <Link href="/dashboard" className="px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors">
            Yeni Analiz Başlat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {analysesWithUrls.map((analysis) => (
            <Link 
              href={`/dashboard/results/${analysis.id}`} 
              key={analysis.id}
              className="group block relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className="aspect-square w-full relative overflow-hidden bg-black/50">
                <DeleteButton id={analysis.id} />
                
                {analysis.photoUrl ? (
                  <img 
                    src={analysis.photoUrl} 
                    alt="Analiz fotoğrafı" 
                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-zinc-700" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-purple-400 font-medium mb-1">
                        {new Date(analysis.created_at).toLocaleDateString('tr-TR', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </p>
                      <h3 className="text-2xl font-serif text-white group-hover:text-pink-100 transition-colors">
                        {analysis.season_type || 'Analiz Ediliyor...'}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
