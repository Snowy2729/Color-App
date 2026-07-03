'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Mail, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Şifre sıfırlama bağlantısı için önce e-posta adresinizi yazın.');
      return;
    }
    setLoading(true);
    setError(null);
    setResetSent(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama bağlantısı gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (needsVerification) {
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
        
        if (data.session) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setNeedsVerification(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-transparent">
      
      {/* 21st.dev style abstract background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center flex flex-col items-center"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4 ">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
            Aura Analyzer
          </h1>
          <p className="text-muted-foreground text-sm">Kişisel renk paletinizi keşfedin</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border bg-card shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6 pt-8 px-8 border-b border-gray-50">
              <CardTitle className="text-xl font-semibold text-foreground tracking-tight">
                {needsVerification 
                  ? 'E-postanızı Doğrulayın' 
                  : isLogin ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {needsVerification
                  ? `${email} adresine gönderilen linke tıklayın.`
                  : isLogin 
                    ? 'Renk profilinize erişmek için e-posta ve şifrenizi girin.'
                    : 'Kişisel analizlerinizi kaydetmek için ücretsiz kayıt olun.'}
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleAuth}>
              <CardContent className="space-y-4 px-8 pt-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                {resetSent && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium">
                    Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. E-postanızı kontrol edin.
                  </div>
                )}
                
                {needsVerification ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-2 border border-purple-100">
                      <Mail className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">E-postanızı Kontrol Edin</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      <strong>{email}</strong> adresine bir onay bağlantısı gönderdik. Lütfen e-postanızı açın ve içerikteki linke tıklayın.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">E-posta adresi</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="ornek@email.com" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 h-11 bg-transparent border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-600 focus-visible:border-purple-600 rounded-xl transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">Şifre</Label>
                        {isLogin && (
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors focus:outline-none"
                          >
                            Şifremi unuttum
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 h-11 bg-transparent border-border text-foreground focus-visible:ring-purple-600 focus-visible:border-purple-600 rounded-xl transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
                {needsVerification ? (
                  <Button 
                    type="button" 
                    onClick={() => {
                      setNeedsVerification(false);
                      setIsLogin(true);
                    }}
                    variant="outline"
                    className="w-full h-11 rounded-xl border-border text-foreground hover:bg-transparent hover:text-foreground font-semibold"
                  >
                    Giriş Sayfasına Dön
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/80 text-white font-semibold  transition-all"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                  </Button>
                )}
                
                {!needsVerification && (
                  <div className="text-center text-sm text-muted-foreground">
                    {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                    <button 
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-1 font-semibold text-purple-600 hover:text-purple-700 transition-colors focus:outline-none"
                    >
                      {isLogin ? 'Şimdi oluşturun' : 'Giriş yapın'}
                    </button>
                  </div>
                )}
                {needsVerification && (
                   <div className="text-center text-xs font-medium text-muted-foreground mt-2">
                     Onayladıktan sonra sayfayı yenileyebilirsiniz.
                   </div>
                )}
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
