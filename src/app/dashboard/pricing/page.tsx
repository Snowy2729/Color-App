'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const [loadingType, setLoadingType] = useState<'monthly' | 'yearly' | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('checkout') === 'success') {
      setCheckoutSuccess(true);
    }
  }, []);

  const handleSubscribe = (planType: 'monthly' | 'yearly') => {
    setLoadingType(planType);
    window.location.href = `/api/polar/checkout?plan=${planType}`;
  };

  const features = [
    'Sınırsız AI Stil Danışmanı Kullanımı',
    'Yüz tipinize özel profesyonel saç renkleri',
    'Mevsiminize uygun makyaj paletleri',
    'En yeni TikTok moda trendleri',
    '7 Gün Ücretsiz Deneme (İstediğin an iptal et)'
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 relative overflow-hidden flex flex-col items-center">
      <div className="max-w-4xl mx-auto relative z-10 w-full">

        {checkoutSuccess && (
          <div className="max-w-2xl mx-auto mb-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-emerald-500 mb-1">Aboneliğiniz başlatıldı! 🎉</h3>
            <p className="text-emerald-500/80 text-sm">
              Premium özellikleriniz birkaç saniye içinde aktifleşir. İyi analizler!
            </p>
          </div>
        )}

        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-sm text-purple-700 font-medium"
          >
            <Sparkles className="w-4 h-4" />
            <span>Premium Özelliklerin Kilidini Aç</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-semibold text-foreground tracking-tight"
          >
            Sizin İçin En İyi Planı Seçin
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto"
          >
            Renk analizinizden tam anlamıyla faydalanmak, AI asistanı sınırları kaldırmak ve özel tavsiyeler almak için Premium'a geçin.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Aylık Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-card border border-border p-8 rounded-3xl flex flex-col "
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Aylık Plan</h3>
              <p className="text-muted-foreground text-sm">Kısa vadeli esneklik arayanlar için ideal.</p>
            </div>
            
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">$39.99</span>
              <span className="text-muted-foreground font-medium">/ay</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-slate-100 p-1 rounded-full shrink-0">
                    <Check className="w-3 h-3 text-foreground" />
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingType !== null}
              className="w-full h-12 rounded-xl border-border text-foreground hover:bg-transparent hover:text-foreground font-semibold text-base"
            >
              {loadingType === 'monthly' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Aylık Başla'
              )}
            </Button>
          </motion.div>

          {/* Yıllık Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-card border-2 border-purple-600 p-8 rounded-3xl flex flex-col shadow-xl shadow-purple-600/5 ring-4 ring-purple-600/10"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold tracking-wide ">
              <Zap className="w-3 h-3 fill-white" /> EN ÇOK TERCİH EDİLEN
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Yıllık Plan</h3>
              <p className="text-muted-foreground text-sm">Uzun vadeli stil yatırımı. %81 tasarruf edin!</p>
            </div>

            <div className="mb-8 flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$89.90</span>
                <span className="text-muted-foreground font-medium">/yıl</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-sm text-emerald-600 font-semibold">Aylık sadece ~7.49$'a gelir</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit px-2.5 py-1 rounded-md mt-2 font-bold tracking-wide flex items-center gap-1">
                  🎁 7 GÜN ÜCRETSİZ DENEME
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-purple-100 p-1 rounded-full shrink-0">
                    <Check className="w-3 h-3 text-purple-700" />
                  </div>
                  <span className="text-foreground text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe('yearly')}
              disabled={loadingType !== null}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/80 text-white font-semibold text-base "
            >
              {loadingType === 'yearly' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Yıllık Başla <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </motion.div>
        </div>

        <div className="text-center mt-10">
          <a
            href="/api/polar/portal"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Mevcut aboneliğinizi yönetin (iptal, kart değişikliği, faturalar)
          </a>
        </div>
      </div>
    </div>
  );
}
