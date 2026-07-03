'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2, ChevronLeft, Download, Share2, Lock, Sparkles, Plus, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // AI Stylist States
  const [customColors, setCustomColors] = useState<string[]>(['#000000']);
  const [stylistLoading, setStylistLoading] = useState(false);
  const [stylistResult, setStylistResult] = useState<any>(null);
  const [stylistError, setStylistError] = useState<string | null>(null);
  const [stylistHistory, setStylistHistory] = useState<any[]>([]);

  // Chat States
  const [activeTab, setActiveTab] = useState<'color' | 'chat'>('color');
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

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
        if (data.isSubscribed !== undefined) {
          setIsSubscribed(data.isSubscribed);
        }
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

    const fetchStylistHistory = async () => {
      try {
        const res = await fetch('/api/stylist-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId: id })
        });
        const data = await res.json();
        if (data.success && data.history) {
          setStylistHistory(data.history);
        }
      } catch (err) {
        console.error('History error:', err);
      }
    };
    
    fetchPalettes();
    fetchStylistHistory();
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

  const handleUpgrade = () => {
    router.push('/dashboard/pricing');
  };

  const handleAskStylist = async () => {
    if (customColors.length === 0) return;
    setStylistLoading(true);
    setStylistError(null);
    try {
      const res = await fetch('/api/ask-stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, colors: customColors })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStylistResult(data.result);
      
      setStylistHistory(prev => [{
        id: Math.random().toString(),
        colors: customColors,
        overall_suitability: data.result.overallSuitability,
        feedback: data.result.feedback,
        suggestions: data.result.suggestions,
        created_at: new Date().toISOString()
      }, ...prev]);
      
    } catch (err: any) {
      setStylistError(err.message || 'Yapay zekaya bağlanılamadı.');
    } finally {
      setStylistLoading(false);
    }
  };

  const handleAskChat = async () => {
    if (!chatQuery.trim()) return;
    
    const userMessage = chatQuery.trim();
    setChatQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ask-stylist-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, query: userMessage })
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);
      
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen tekrar deneyin.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getTextColor = (hex: string) => {
    // Hex'i RGB'ye çevir ve parlaklığı hesapla
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // SMPTE C, Rec. 709
    return luma < 128 ? 'text-foreground' : 'text-black';
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
        <h2 className="text-2xl font-serif text-foreground animate-pulse">Renk Paletiniz Çıkarılıyor...</h2>
        <p className="text-muted-foreground">Yapay zeka analiz sonuçlarınıza uygun 20 özel renk seçiliyor</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="text-red-400 text-xl">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline" className="text-foreground border-border">Tekrar Dene</Button>
      </div>
    );
  }

  const clothingColors = palettes.filter(p => p.category === 'clothing').slice(0, 10);
  const makeupColors = palettes.filter(p => p.category === 'makeup').slice(0, 5);
  const hairColors = palettes.filter(p => p.category === 'hair').slice(0, 5);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-foreground">
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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mevsim tipinize ve cilt alt tonunuza özel olarak seçilmiş kusursuz renk kombinasyonları. Kodları kopyalamak için renklere tıklayın.
          </p>
        </motion.div>
      </div>

      {/* Clothing Section */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <h2 className="text-2xl font-serif text-foreground border-b border-border pb-2">Kıyafet Önerileri</h2>
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
                <p className="text-foreground text-sm font-medium leading-tight">{color.color_name}</p>
                <p className="text-foreground/70 text-xs font-mono uppercase">{color.hex_code}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Makeup Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 relative">
          {!isSubscribed && (
            <div className="absolute inset-0 z-10 backdrop-blur-xl bg-black/60 flex flex-col items-center justify-center rounded-3xl border border-border m-[-1rem]">
              <Lock className="w-10 h-10 text-purple-400 mb-3" />
              <p className="text-foreground font-serif text-xl mb-4">Makyaj Tonları Premium'a Özel</p>
              <Button onClick={handleUpgrade} className="bg-gradient-to-r from-purple-500 to-pink-500 text-foreground rounded-full px-8 hover:scale-105 transition-transform">Kilidi Aç</Button>
            </div>
          )}
          <h2 className="text-2xl font-serif text-foreground border-b border-border pb-2">Makyaj Tonları</h2>
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
                  <p className="text-foreground text-xs font-medium text-center px-2">{color.color_name}</p>
                  <p className="text-foreground/80 text-[10px] font-mono mt-1">{color.hex_code}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hair Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 relative">
          {!isSubscribed && (
            <div className="absolute inset-0 z-10 backdrop-blur-xl bg-black/60 flex flex-col items-center justify-center rounded-3xl border border-border m-[-1rem]">
              <Lock className="w-10 h-10 text-purple-400 mb-3" />
              <p className="text-foreground font-serif text-xl mb-4">Saç Renkleri Premium'a Özel</p>
              <Button onClick={handleUpgrade} className="bg-gradient-to-r from-purple-500 to-pink-500 text-foreground rounded-full px-8 hover:scale-105 transition-transform">Kilidi Aç</Button>
            </div>
          )}
          <h2 className="text-2xl font-serif text-foreground border-b border-border pb-2">Saç Renkleri</h2>
          <div className="flex flex-col gap-3">
            {hairColors.map((color) => (
              <motion.div
                key={color.id}
                variants={itemVariants}
                whileHover={{ x: 10 }}
                onClick={() => copyToClipboard(color.hex_code)}
                className="group cursor-pointer flex items-center justify-between p-4 rounded-xl bg-transparent border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-inner border border-border"
                    style={{ backgroundColor: color.hex_code }}
                  ></div>
                  <div>
                    <p className="text-foreground font-medium">{color.color_name}</p>
                    <p className="text-muted-foreground text-sm font-mono">{color.hex_code}</p>
                  </div>
                </div>
                {copiedHex === color.hex_code ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
        className="fixed top-0 left-0 bg-transparent flex-col items-center justify-between p-16 z-[-100] text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[120px] mix-blend-screen"></div>
        
        <div className="relative z-10 w-full pt-12 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 mb-6 shadow-2xl">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-7xl font-serif text-foreground tracking-tight">Kişisel Renk Paletim</h1>
          <p className="text-3xl text-muted-foreground font-light">Aura Analyzer AI tarafından analiz edildi</p>
        </div>

        <div className="relative z-10 w-full flex-1 flex flex-col justify-center gap-12 mt-20">
          {/* Sadece en iyi 6 kıyafet rengini karta koyuyoruz */}
          <div className="w-full">
            <h2 className="text-4xl font-serif text-foreground/90 mb-8 border-b border-border pb-4">Bana En Uygun Renkler</h2>
            <div className="grid grid-cols-3 gap-6">
              {clothingColors.slice(0, 6).map((color) => (
                <div key={color.id} className="rounded-3xl overflow-hidden aspect-square flex flex-col shadow-2xl border border-white/5 bg-card">
                  <div className="flex-1" style={{ backgroundColor: color.hex_code }}></div>
                  <div className="p-4 bg-black/60 backdrop-blur-md">
                    <p className="text-foreground text-xl font-medium">{color.color_name}</p>
                    <p className="text-foreground/60 text-lg font-mono">{color.hex_code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 w-full mt-8">
            <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-8">
              <h2 className="text-3xl font-serif text-foreground/90 mb-6 border-b border-border pb-4">Makyaj</h2>
              <div className="flex justify-center gap-4">
                {makeupColors.slice(0, 3).map(color => (
                  <div key={color.id} className="w-24 h-24 rounded-full shadow-lg border-4 border-border" style={{ backgroundColor: color.hex_code }}></div>
                ))}
              </div>
            </div>
            <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-8">
              <h2 className="text-3xl font-serif text-foreground/90 mb-6 border-b border-border pb-4">Saç</h2>
              <div className="flex justify-center gap-4">
                {hairColors.slice(0, 3).map(color => (
                  <div key={color.id} className="w-24 h-24 rounded-full shadow-lg border-4 border-border" style={{ backgroundColor: color.hex_code }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full pb-12 mt-12 flex justify-between items-center border-t border-border pt-12">
          <p className="text-3xl text-muted-foreground font-serif">aura-analyzer.com</p>
          <div className="text-right">
            <p className="text-xl text-muted-foreground">Sen de kendi renklerini bul</p>
            <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">@auraanalyzer</p>
          </div>
        </div>
      </div>

      {/* AI Stylist Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-3xl mx-auto mt-20 p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-pink-400" />
            <h2 className="text-3xl font-serif text-foreground">Yapay Zeka Stil Danışmanı</h2>
          </div>
          
          <div className="flex border-b border-white/10 mb-8">
            <button 
              onClick={() => setActiveTab('color')}
              className={`px-6 py-3 font-medium text-lg border-b-2 transition-all ${activeTab === 'color' ? 'border-pink-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Renk Kombini Test Et
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 font-medium text-lg border-b-2 transition-all ${activeTab === 'chat' ? 'border-pink-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Asistana Soru Sor
            </button>
          </div>

          {activeTab === 'color' ? (
            <>
              <p className="text-muted-foreground mb-8">
                Kendi seçtiğin renklerin sana yakışıp yakışmayacağını merak mı ediyorsun? Aşağıdan 1 ila 3 arasında renk seç (Combo oluştur) ve AI Stilist'e sor!
              </p>
              
              <div className="flex flex-wrap items-end gap-6 mb-8">
                {customColors.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3 relative group">
                    <label className="text-sm text-muted-foreground font-medium">Renk {idx + 1}</label>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-border group-hover:border-gray-300 transition-all shadow-2xl hover:scale-105 cursor-pointer flex items-center justify-center bg-black">
                      <input 
                        type="color" 
                        value={color}
                        onChange={(e) => {
                          const newColors = [...customColors];
                          newColors[idx] = e.target.value;
                          setCustomColors(newColors);
                        }}
                        className="w-32 h-32 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 p-0"
                        style={{ WebkitAppearance: 'none' }}
                      />
                      <div className="absolute inset-0 pointer-events-none rounded-full" style={{ backgroundColor: color }}></div>
                    </div>
                    {customColors.length > 1 && (
                      <button 
                        onClick={() => setCustomColors(customColors.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-4 bg-red-500 hover:bg-red-600 text-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-sm font-mono text-muted-foreground bg-card px-3 py-1 rounded-full">{color.toUpperCase()}</span>
                  </div>
                ))}
                
                {customColors.length < 3 && (
                  <button 
                    onClick={() => setCustomColors([...customColors, '#ffffff'])}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-white/40 hover:bg-accent hover:text-accent-foreground flex flex-col items-center justify-center gap-1 transition-all mb-[38px] text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                )}
              </div>

          <Button 
            onClick={handleAskStylist} 
            disabled={stylistLoading || customColors.length === 0}
            className="w-full sm:w-auto bg-card hover:bg-zinc-200 text-black rounded-full px-8 py-6 text-lg font-medium transition-all shadow-xl shadow-white/10"
          >
            {stylistLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
            Bu Renkler Bana Yakışır Mı?
          </Button>

          {stylistError && <p className="text-red-400 mt-4">{stylistError}</p>}

          <AnimatePresence>
            {stylistResult && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${stylistResult.overallSuitability ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {stylistResult.overallSuitability ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-serif mb-2 ${stylistResult.overallSuitability ? 'text-green-400' : 'text-red-400'}`}>
                      {stylistResult.overallSuitability ? 'Harika Bir Seçim!' : 'Biraz Değişiklik Gerekebilir'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">{stylistResult.feedback}</p>
                    
                    {stylistResult.suggestions && stylistResult.suggestions.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h4 className="text-foreground font-medium border-b border-border pb-2">Stilist Önerileri</h4>
                        {stylistResult.suggestions.map((sug: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card p-4 rounded-2xl border border-white/5">
                            {sug.badColor && sug.badColor !== '' && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border border-border" style={{ backgroundColor: sug.badColor }}></div>
                                <span className="text-muted-foreground line-through font-mono">{sug.badColor}</span>
                                <ChevronLeft className="w-4 h-4 text-zinc-600 mx-2 rotate-180" />
                              </div>
                            )}
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => copyToClipboard(sug.suggestedColor)}>
                              <div className="w-12 h-12 rounded-full border-2 border-border shadow-lg shadow-black/50 relative overflow-hidden" style={{ backgroundColor: sug.suggestedColor }}>
                                <div className="absolute inset-0 bg-card opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Copy className="w-4 h-4 text-foreground" />
                                </div>
                              </div>
                              <span className="text-foreground font-mono font-medium">{sug.suggestedColor}</span>
                            </div>
                            <div className="flex-1 text-sm text-muted-foreground italic">"{sug.reason}"</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Geçmiş Sorgular */}
          {stylistHistory.length > 0 && (
            <div className="mt-12 pt-12 border-t border-border">
              <h3 className="text-2xl font-serif text-foreground mb-6">Geçmiş Analizleriniz</h3>
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {stylistHistory.map((historyItem) => (
                  <div key={historyItem.id} className="bg-black/30 p-6 rounded-2xl border border-white/5">
                    <div className="flex gap-3 mb-4">
                      {historyItem.colors.map((c: string, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full border border-border shadow-md" style={{ backgroundColor: c }}></div>
                      ))}
                    </div>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl ${historyItem.overall_suitability ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {historyItem.overall_suitability ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground leading-relaxed text-sm">{historyItem.feedback}</p>
                        {historyItem.suggestions && historyItem.suggestions.length > 0 && (
                          <div className="mt-4 space-y-3 border-t border-white/5 pt-3">
                            {historyItem.suggestions.map((sug: any, idx: number) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  {sug.badColor && sug.badColor !== '' && (
                                    <>
                                      <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: sug.badColor }}></div>
                                      <ChevronLeft className="w-3 h-3 text-zinc-600 rotate-180" />
                                    </>
                                  )}
                                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: sug.suggestedColor }}></div>
                                  <span className="text-muted-foreground font-mono">{sug.suggestedColor}</span>
                                </div>
                                <span className="text-muted-foreground italic mt-1 sm:mt-0 sm:ml-2">"{sug.reason}"</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>
          ) : (
            <div className="flex flex-col gap-6">
              <p className="text-muted-foreground">
                Kıyafet, renk kombinleri, stil tavsiyeleri veya makyaj tonları hakkında yapay zeka stil danışmanınıza istediğiniz her şeyi sorabilirsiniz!
              </p>
              
              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 min-h-[300px] max-h-[500px] overflow-y-auto flex flex-col gap-4">
                {chatHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <Sparkles className="w-12 h-12 mb-4" />
                    <p>Sohbeti başlatmak için bir soru sorun.</p>
                    <p className="text-sm mt-2">Örn: "Mezuniyet balosu için ne renk elbise giymeliyim?"</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[85%] text-sm md:text-base border ${
                        msg.role === 'user' 
                          ? 'bg-white/10 text-white rounded-tr-sm border-white/5' 
                          : 'bg-pink-500/20 text-white rounded-tl-sm border-pink-500/30'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex items-start gap-2">
                    <div className="bg-pink-500/20 text-white p-4 rounded-2xl rounded-tl-sm border border-pink-500/30 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskChat()}
                  placeholder="Bana stil ile ilgili bir soru sor..."
                  className="flex-1 bg-black/50 border border-border rounded-full px-6 py-4 text-foreground focus:outline-none focus:border-pink-500/50 transition-colors"
                />
                <Button 
                  onClick={handleAskChat}
                  disabled={chatLoading || !chatQuery.trim()}
                  className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0 p-0"
                >
                  <Plus className="w-6 h-6 text-white rotate-45" style={{ transform: 'rotate(0deg)' }} /> 
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* TikTok Trendleri Bölümü */}
      {analysis && (
        <div className="max-w-5xl mx-auto mt-20 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.36 6.34 6.34 0 0 0 6.26-6.36V11a8.27 8.27 0 0 0 2.06.27V7.83a4.12 4.12 0 0 1-1-1.14z"/>
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-foreground">Senin Renklerine Uygun TikTok Trendleri</h2>
              <p className="text-muted-foreground">"{analysis.season_type}" mevsim tipine uygun en popüler kombin videoları (Apify AI ile çekildi)</p>
            </div>
          </div>

          {isTiktokLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[9/16] w-full bg-zinc-900 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : tiktokVideos.length > 0 ? (
            <div className="relative">
              {!isSubscribed && (
                <div className="absolute inset-0 z-10 backdrop-blur-xl bg-black/50 flex flex-col items-center justify-center rounded-3xl border border-border">
                  <Lock className="w-12 h-12 text-[#00f2fe] mb-4" />
                  <h3 className="text-2xl font-serif text-foreground mb-2">TikTok Trendleri</h3>
                  <p className="text-muted-foreground mb-6 max-w-md text-center">Size en uygun kombin videolarını görmek için Premium abonesi olun.</p>
                  <Button onClick={handleUpgrade} className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-medium rounded-full px-8 py-6 text-lg hover:scale-105 transition-transform shadow-lg shadow-[#00f2fe]/20">
                    Aboneliği Başlat
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {tiktokVideos.map((video) => (
                <a 
                  key={video.id} 
                  href={video.webVideoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block relative overflow-hidden rounded-3xl border border-border bg-card hover:border-gray-300 transition-all"
                >
                  <div className="aspect-[9/16] w-full relative">
                    <img 
                      src={`/api/proxy-image?url=${encodeURIComponent(video.coverUrl)}`} 
                      alt="TikTok Cover" 
                      className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <p className="text-foreground text-sm font-medium line-clamp-2 mb-2">{video.text}</p>
                      <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-full backdrop-blur-md">TikTok'ta İzle</span>
                    </div>
                  </div>
                </a>
              ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-3xl border border-border text-muted-foreground">
              Bu mevsim tipine uygun popüler video bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
