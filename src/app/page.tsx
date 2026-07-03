'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FullScreenScrollFx } from '@/components/ui/full-screen-scroll-fx';
import { CinematicFooter } from '@/components/ui/cinematic-footer';
import { Sparkles, Palette, PlaySquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const sections = [
    // Section 1: Hero
    <div key="1" className="flex flex-col items-center text-center max-w-3xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-purple-600/20 mb-8"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
      <h1 className="text-6xl md:text-8xl font-semibold tracking-tight text-foreground mb-6">
        Aura Analyzer
      </h1>
      <p className="text-xl md:text-3xl text-muted-foreground font-light mb-8 max-w-2xl">
        Yapay zeka ile kişisel renk paletinizi saniyeler içinde keşfedin. Sadece size özel olan renklerle parlayın.
      </p>
      <div className="flex items-center gap-3 text-muted-foreground font-medium">
        Keşfetmek için aşağı kaydırın <ArrowRight className="w-5 h-5 rotate-90 animate-bounce mt-1" />
      </div>
    </div>,

    // Section 2: Features - Palette
    <div key="2" className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-12">
      <div className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold text-sm">
          <Palette className="w-4 h-4" /> Dört Mevsim Analizi
        </div>
        <h2 className="text-4xl md:text-6xl font-semibold text-foreground tracking-tight leading-tight">
          Sizi En İyi Gösteren <br/> Renkleri Bulun
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
          Cilt alt tonunuz, göz renginiz ve saç renginiz analiz edilerek "Kış, Yaz, İlkbahar veya Sonbahar" paletlerinden hangisine ait olduğunuz belirlenir.
        </p>
      </div>
      <div className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-[2rem] blur-3xl opacity-20"></div>
        <div className="relative bg-card border border-border shadow-2xl p-6 rounded-[2rem]">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-rose-500 rounded-2xl"></div>
            <div className="h-32 bg-emerald-500 rounded-2xl"></div>
            <div className="h-32 bg-blue-600 rounded-2xl"></div>
            <div className="h-32 bg-amber-400 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>,

    // Section 3: Features - TikTok
    <div key="3" className="flex flex-col md:flex-row-reverse items-center justify-between w-full max-w-5xl gap-12">
      <div className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold text-sm">
          <PlaySquare className="w-4 h-4 text-pink-500" /> Trend Olun
        </div>
        <h2 className="text-4xl md:text-6xl font-semibold text-foreground tracking-tight leading-tight">
          TikTok Moda <br/> Trendlerini Yakalayın
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
          Analiz sonucunuza özel olarak, TikTok'taki en son makyaj ve stil trendleri videoları anında karşınıza gelsin.
        </p>
      </div>
      <div className="flex-1 w-full relative flex justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-[2rem] blur-3xl opacity-10"></div>
        
        {/* Modern CSS Phone Mockup */}
        <div className="relative bg-card/30 border border-white/10 shadow-2xl p-3 rounded-[3rem] flex justify-center items-center h-[500px] w-[250px] backdrop-blur-xl">
           {/* Phone screen */}
           <div className="w-full h-full bg-black rounded-[2.2rem] border-[4px] border-zinc-900 overflow-hidden flex items-center justify-center relative shadow-inner">
             {/* Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-zinc-900 rounded-b-xl z-10"></div>
             
             {/* TikTok Logo with Chromatic Aberration Effect */}
             <svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl z-0">
               <g style={{ mixBlendMode: 'screen' }}>
                 {/* Cyan Shift */}
                 <path fill="#25F4EE" transform="translate(-0.8, -0.8)" d="M19.589 6.686a4.793 4.793 0 01-3.97-1.561 4.795 4.795 0 01-1.236-3.184h-3.98v13.303a3.981 3.981 0 01-3.98 3.98 3.981 3.981 0 01-3.98-3.98 3.981 3.981 0 013.98-3.98c.176 0 .347.016.516.042V7.185a7.973 7.973 0 00-4.496 7.11 7.981 7.981 0 007.98 7.98 7.981 7.981 0 007.98-7.98V8.903a8.815 8.815 0 005.185 1.686v-3.98a4.811 4.811 0 01-3.979-.809z"/>
                 {/* Red Shift */}
                 <path fill="#FE2C55" transform="translate(0.8, 0.8)" d="M19.589 6.686a4.793 4.793 0 01-3.97-1.561 4.795 4.795 0 01-1.236-3.184h-3.98v13.303a3.981 3.981 0 01-3.98 3.98 3.981 3.981 0 01-3.98-3.98 3.981 3.981 0 013.98-3.98c.176 0 .347.016.516.042V7.185a7.973 7.973 0 00-4.496 7.11 7.981 7.981 0 007.98 7.98 7.981 7.981 0 007.98-7.98V8.903a8.815 8.815 0 005.185 1.686v-3.98a4.811 4.811 0 01-3.979-.809z"/>
                 {/* White Center */}
                 <path fill="#FFFFFF" d="M19.589 6.686a4.793 4.793 0 01-3.97-1.561 4.795 4.795 0 01-1.236-3.184h-3.98v13.303a3.981 3.981 0 01-3.98 3.98 3.981 3.981 0 01-3.98-3.98 3.981 3.981 0 013.98-3.98c.176 0 .347.016.516.042V7.185a7.973 7.973 0 00-4.496 7.11 7.981 7.981 0 007.98 7.98 7.981 7.981 0 007.98-7.98V8.903a8.815 8.815 0 005.185 1.686v-3.98a4.811 4.811 0 01-3.979-.809z"/>
               </g>
             </svg>
           </div>
        </div>
      </div>
    </div>,

    // Section 4: AI Assistant Feature
    <div key="4" className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-12">
      <div className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500 to-purple-500 rounded-[2rem] blur-3xl opacity-10"></div>
        <div className="relative bg-card/40 border border-white/5 shadow-2xl p-6 rounded-[2rem] flex flex-col gap-4 backdrop-blur-xl">
          {/* Chat Mockup */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 text-foreground p-4 rounded-2xl rounded-tl-sm self-start max-w-[85%] border border-white/5 text-sm md:text-base">
              Bu akşamki özel davet için hangi renk elbise giymeliyim?
            </div>
            <div className="bg-primary/20 text-foreground p-4 rounded-2xl rounded-tr-sm self-end max-w-[90%] border border-primary/30 flex gap-3 items-start text-sm md:text-base">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>Senin "Kış" paletine göre zümrüt yeşili veya saks mavisi bir elbise harika duracaktır. Dudaklarında ise soğuk tonlu bir bordo ruj kullanabilirsin!</p>
            </div>
          </div>
          {/* Input Mockup */}
          <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/10"></div>
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
            <div className="ml-auto w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-primary" /> Yapay Zeka Asistanı
        </div>
        <h2 className="text-4xl md:text-6xl font-semibold text-foreground tracking-tight leading-tight">
          Kişisel Stil <br/> Danışmanınız
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
          Paletinize özel makyaj, saç rengi ve giyim kombinleri hakkında merak ettiğiniz her şeyi 7/24 yapay zeka asistanımıza sorabilirsiniz.
        </p>
      </div>
    </div>
  ];

  return (
    <div className="bg-transparent w-full font-sans overflow-x-hidden">
      <FullScreenScrollFx>
        {sections}
      </FullScreenScrollFx>
      
      {/* 21st.dev Cinematic Footer Reveal */}
      <CinematicFooter />
    </div>
  );
}
