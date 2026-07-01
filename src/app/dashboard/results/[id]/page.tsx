'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2, ChevronLeft, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

interface Palette {
  id: string;
  category: string;
  hex_code: string;
  color_name: string;
}

interface Analysis {
  season_type: string;
}

interface TikTokVideo {
  id: string;
  text: string;
  coverUrl: string;
  webVideoUrl: string;
  authorMeta?: { name: string };
}

export default function ResultsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [isTiktokLoading, setIsTiktokLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPalettes = async () => {
      try {
        const res = await fetch('/api/generate-palette', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId: id })
        });
        const data = await res.json();
        
        if (!data.success) throw new Error(data.error || 'Paletler yüklenemedi');
        
        setPalettes(data.palettes);
        if (data.analysis) {
          setAnalysis(data.analysis);
          fetchTiktokTrends(data.analysis.season_type);
        }
      } catch (err: any) {
        setError(err.message || 'Paletler oluşturulurken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPalettes();
  }, [id]);

  const fetchTiktokTrends = async (seasonType: string) => {
    setIsTiktokLoading(true);
    try {
      const res = await fetch('/api/tiktok-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, seasonType })
      });
      const data = await res.json();
      if (data.success && data.videos) {
        setTiktokVideos(data.videos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTiktokLoading(false);
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const getTextColor = (hex: string) => {
    // Hex'i RGB'ye çevir ve parlaklığı hesapla
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // SMPTE C, Rec. 709
    return luma < 128 ? 'text-white' : 'text-black';
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    
    try {
      // Geçici olarak kartı görünür yap
      cardRef.current.style.display = 'flex';
      
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#09090b',
        style: {
          display: 'flex',
          transform: 'none'
        }
      });
      
      // Tekrar gizle
      cardRef.current.style.display = 'none';

      // İndir
      const link = document.createElement('a');
      link.download = `Aura-Analyzer-Paletim.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Görsel oluşturulurken hata:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-pink-500 animate-spin reverse"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-blue-500 animate-spin"></div>
        </div>
        <h2 className="text-2xl font-serif text-white animate-pulse">Renk Paletiniz Çıkarılıyor...</h2>
        <p className="text-zinc-400">Yapay zeka analiz sonuçlarınıza uygun 20 özel renk seçiliyor</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="text-red-400 text-xl">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline" className="text-white border-white/20">Tekrar Dene</Button>
      </div>
    );
  }

  const clothingColors = palettes.filter(p => p.category === 'clothing').slice(0, 10);
  const makeupColors = palettes.filter(p => p.category === 'makeup').slice(0, 5);
  const hairColors = palettes.filter(p => p.category === 'hair').slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-zinc-400 hover:text-white">
          <ChevronLeft className="w-4 h-4 mr-2" /> Yeni Analiz
        </Button>
        <Button 
          onClick={handleDownload}
          disabled={isDownloading}
          variant="outline" 
          className="bg-purple-500/10 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 transition-all"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
          Hikayede Paylaş (İndir)
        </Button>
      </div>

      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 mb-2">
            Kişisel Renk Paletiniz
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Mevsim tipinize ve cilt alt tonunuza özel olarak seçilmiş kusursuz renk kombinasyonları. Kodları kopyalamak için renklere tıklayın.
          </p>
        </motion.div>
      </div>

      {/* Clothing Section */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <h2 className="text-2xl font-serif text-white border-b border-white/10 pb-2">Kıyafet Önerileri</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {clothingColors.map((color) => (
            <motion.div
              key={color.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(color.hex_code)}
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg aspect-square relative"
              style={{ backgroundColor: color.hex_code }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100">
                {copiedHex === color.hex_code ? (
                  <CheckCircle2 className={`w-8 h-8 ${getTextColor(color.hex_code)}`} />
                ) : (
                  <Copy className={`w-8 h-8 ${getTextColor(color.hex_code)}`} />
                )}
              </div>
              <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium leading-tight">{color.color_name}</p>
                <p className="text-white/70 text-xs font-mono uppercase">{color.hex_code}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Makeup Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <h2 className="text-2xl font-serif text-white border-b border-white/10 pb-2">Makyaj Tonları</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {makeupColors.map((color) => (
              <motion.div
                key={color.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                onClick={() => copyToClipboard(color.hex_code)}
                className="group cursor-pointer rounded-full overflow-hidden shadow-lg aspect-square relative border-4 border-white/5"
                style={{ backgroundColor: color.hex_code }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 backdrop-blur-sm transition-all rounded-full">
                  <p className="text-white text-xs font-medium text-center px-2">{color.color_name}</p>
                  <p className="text-white/80 text-[10px] font-mono mt-1">{color.hex_code}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hair Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <h2 className="text-2xl font-serif text-white border-b border-white/10 pb-2">Saç Renkleri</h2>
          <div className="flex flex-col gap-3">
            {hairColors.map((color) => (
              <motion.div
                key={color.id}
                variants={itemVariants}
                whileHover={{ x: 10 }}
                onClick={() => copyToClipboard(color.hex_code)}
                className="group cursor-pointer flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-inner border border-white/20"
                    style={{ backgroundColor: color.hex_code }}
                  ></div>
                  <div>
                    <p className="text-white font-medium">{color.color_name}</p>
                    <p className="text-zinc-400 text-sm font-mono">{color.hex_code}</p>
                  </div>
                </div>
                {copiedHex === color.hex_code ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hidden Shareable Card for HTML2Canvas (9:16 aspect ratio - 1080x1920 base format) */}
      <div 
        ref={cardRef}
        style={{ display: 'none', width: '1080px', height: '1920px' }}
        className="fixed top-0 left-0 bg-zinc-950 flex-col items-center justify-between p-16 z-[-100] text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[120px] mix-blend-screen"></div>
        
        <div className="relative z-10 w-full pt-12 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 mb-6 shadow-2xl">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-7xl font-serif text-white tracking-tight">Kişisel Renk Paletim</h1>
          <p className="text-3xl text-zinc-400 font-light">Aura Analyzer AI tarafından analiz edildi</p>
        </div>

        <div className="relative z-10 w-full flex-1 flex flex-col justify-center gap-12 mt-20">
          {/* Sadece en iyi 6 kıyafet rengini karta koyuyoruz */}
          <div className="w-full">
            <h2 className="text-4xl font-serif text-white/90 mb-8 border-b border-white/10 pb-4">Bana En Uygun Renkler</h2>
            <div className="grid grid-cols-3 gap-6">
              {clothingColors.slice(0, 6).map((color) => (
                <div key={color.id} className="rounded-3xl overflow-hidden aspect-square flex flex-col shadow-2xl border border-white/5 bg-zinc-900/50">
                  <div className="flex-1" style={{ backgroundColor: color.hex_code }}></div>
                  <div className="p-4 bg-black/60 backdrop-blur-md">
                    <p className="text-white text-xl font-medium">{color.color_name}</p>
                    <p className="text-white/60 text-lg font-mono">{color.hex_code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 w-full mt-8">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-serif text-white/90 mb-6 border-b border-white/10 pb-4">Makyaj</h2>
              <div className="flex justify-center gap-4">
                {makeupColors.slice(0, 3).map(color => (
                  <div key={color.id} className="w-24 h-24 rounded-full shadow-lg border-4 border-white/10" style={{ backgroundColor: color.hex_code }}></div>
                ))}
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-serif text-white/90 mb-6 border-b border-white/10 pb-4">Saç</h2>
              <div className="flex justify-center gap-4">
                {hairColors.slice(0, 3).map(color => (
                  <div key={color.id} className="w-24 h-24 rounded-full shadow-lg border-4 border-white/10" style={{ backgroundColor: color.hex_code }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full pb-12 mt-12 flex justify-between items-center border-t border-white/10 pt-12">
          <p className="text-3xl text-zinc-500 font-serif">aura-analyzer.com</p>
          <div className="text-right">
            <p className="text-xl text-zinc-400">Sen de kendi renklerini bul</p>
            <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">@auraanalyzer</p>
          </div>
        </div>
      </div>

      {/* TikTok Trendleri Bölümü */}
      {analysis && (
        <div className="max-w-5xl mx-auto mt-20 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.36 6.34 6.34 0 0 0 6.26-6.36V11a8.27 8.27 0 0 0 2.06.27V7.83a4.12 4.12 0 0 1-1-1.14z"/>
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-white">Senin Renklerine Uygun TikTok Trendleri</h2>
              <p className="text-zinc-400">"{analysis.season_type}" mevsim tipine uygun en popüler kombin videoları (Apify AI ile çekildi)</p>
            </div>
          </div>

          {isTiktokLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[9/16] w-full bg-zinc-900 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : tiktokVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {tiktokVideos.map((video) => (
                <a 
                  key={video.id} 
                  href={video.webVideoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 hover:border-white/30 transition-all"
                >
                  <div className="aspect-[9/16] w-full relative">
                    <img 
                      src={`/api/proxy-image?url=${encodeURIComponent(video.coverUrl)}`} 
                      alt="TikTok Cover" 
                      className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <p className="text-white text-sm font-medium line-clamp-2 mb-2">{video.text}</p>
                      <span className="text-xs text-zinc-400 bg-white/10 px-2 py-1 rounded-full backdrop-blur-md">TikTok'ta İzle</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-zinc-900/50 rounded-3xl border border-white/10 text-zinc-400">
              Bu mevsim tipine uygun popüler video bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
