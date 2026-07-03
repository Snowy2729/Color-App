'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { UploadCloud, Camera, Loader2, AlertCircle, Info, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import Webcam from 'react-webcam';

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  
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

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const capturedFile = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setFile(capturedFile);
          setPreview(imageSrc);
          setIsCameraOpen(false);
          setError(null);
        });
    }
  }, [webcamRef]);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Oturum açmanız gerekiyor.');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analiz sırasında bir hata oluştu.');
      }

      router.push(`/dashboard/results/${result.analysisId}`);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Yeni Analiz Başlat</h1>
        <p className="text-muted-foreground">Yapay zeka ile kişisel renk analizinizi yapmak için net bir fotoğrafınızı yükleyin veya hemen çekin.</p>
      </div>

      {error && (
        <div className="w-full p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 ">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="w-full p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-blue-800 ">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <div className="text-sm space-y-1">
          <p className="font-semibold text-blue-900">En iyi sonuç için ipuçları:</p>
          <ul className="list-disc list-inside text-blue-700/80 pl-1 space-y-0.5">
            <li>Doğal gün ışığında (pencere karşısında) çekilmiş olmalı</li>
            <li>Yüzünüzde makyaj olmamalı veya çok hafif olmalı</li>
            <li>Fotoğraf çok karanlık veya bulanık olmamalı</li>
          </ul>
        </div>
      </div>

      <div className="w-full bg-card border border-border rounded-2xl  overflow-hidden">
        {isCameraOpen ? (
          <div className="relative bg-black flex flex-col items-center justify-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute bottom-8 flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsCameraOpen(false)}
                className="rounded-full w-14 h-14 p-0 flex items-center justify-center bg-card/20 text-white backdrop-blur-md hover:bg-card/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <button 
                type="button" 
                onClick={capturePhoto}
                className="rounded-full w-14 h-14 p-0 flex items-center justify-center bg-card text-black hover:scale-105 transition-transform shadow-xl"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : !preview ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Fotoğraf Yükle</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm">
              Galerinizden bir fotoğraf seçin veya kameranızı kullanarak hemen yeni bir fotoğraf çekin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 rounded-xl border-border text-foreground hover:bg-transparent hover:text-foreground font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Dosya Seç
              </Button>
              <Button 
                type="button" 
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/80 text-white font-medium "
                onClick={() => setIsCameraOpen(true)}
              >
                <Camera className="w-4 h-4 mr-2" />
                Kamerayı Aç
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={preview} 
              alt="Selfie Önizleme" 
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPreview(null)}
                  disabled={uploading}
                  className="h-12 rounded-xl bg-card/20 border-white/30 text-white backdrop-blur-md hover:bg-card/30 font-medium"
                >
                  Değiştir
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/80 text-white font-medium shadow-lg"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Yapay Zeka Analiz Ediyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
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
      </div>
    </div>
  );
}
