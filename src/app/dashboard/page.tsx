'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Camera, Loader2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Oturum açmanız gerekiyor.');

      // 1. Storage'a Yükleme
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Analiz için API'ye gönderme (Claude)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analiz sırasında bir hata oluştu.');
      }

      // Analiz başarılı, sonuç sayfasına yönlendir (Faz 4)
      router.push(`/dashboard/results/${result.analysisId}`);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif text-white tracking-tight">Selfie Yükle</h1>
        <p className="text-zinc-400">Yapay zeka ile kişisel renk analizinizi yapmak için net bir fotoğrafınızı yükleyin.</p>
      </div>

      {error && (
        <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-blue-300">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm space-y-1">
          <p className="font-medium text-blue-200">En iyi sonuç için ipuçları:</p>
          <ul className="list-disc list-inside opacity-80 pl-1 space-y-1">
            <li>Doğal gün ışığında (pencere karşısında) çekilmiş olmalı</li>
            <li>Yüzünüzde makyaj olmamalı veya çok hafif olmalı</li>
            <li>Fotoğraf çok karanlık veya bulanık olmamalı</li>
          </ul>
        </div>
      </div>

      <Card className="w-full border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {!preview ? (
            <div 
              className="p-12 border-2 border-dashed border-white/10 m-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Fotoğraf seçin veya sürükleyin</h3>
              <p className="text-sm text-zinc-500 mb-6">PNG, JPG veya JPEG (Maks. 5MB)</p>
              
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/10">
                  Dosya Seç
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={preview} 
                alt="Selfie Önizleme" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setPreview(null)}
                    disabled={uploading}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/80 backdrop-blur-md"
                  >
                    Başka Seç
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analizi Başlat
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg,image/png,image/jpg" 
            className="hidden" 
          />
        </CardContent>
      </Card>
    </div>
  );
}
