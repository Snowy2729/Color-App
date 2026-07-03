'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for mail
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent py-24 px-6 relative z-10 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-card border border-border p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-md">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">
            Destek Merkezi
          </h1>
          <p className="text-muted-foreground text-lg">
            Sorunlarınızı veya önerilerinizi doğrudan bize iletin. <br />
            Doğrudan e-posta: <a href="mailto:yusuf@vpxagent.com" className="text-primary hover:underline font-medium">yusuf@vpxagent.com</a>
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-emerald-500 mb-2">Talebiniz Alındı!</h3>
            <p className="text-emerald-500/80">
              Mesajınız yusuf@vpxagent.com adresine başarıyla iletildi. En kısa sürede size dönüş yapacağız.
            </p>
            <Button onClick={() => setSent(false)} variant="outline" className="mt-6 border-border text-foreground hover:bg-accent">
              Yeni Mesaj Gönder
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">İsim</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Adınız"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Soyisim</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-posta Adresiniz</label>
              <input 
                type="email" 
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="ornek@mail.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Konu Başlığı</label>
              <input 
                type="text" 
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Hangi konuda destek istiyorsunuz?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mesajınız</label>
              <textarea 
                required
                rows={5}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="Lütfen detayları buraya yazın..."
              ></textarea>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/80 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Talebi Gönder
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
