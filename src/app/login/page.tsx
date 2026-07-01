'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Mail, Lock, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (needsVerification) {
        // E-posta doğrulama (OTP) adımı
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'signup'
        });
        
        if (error) throw error;
        
        // Doğrulama başarılı, dashboard'a yönlendir
        router.push('/dashboard');
        router.refresh();
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Kayıt başarılı olduğunda kodu girmesi için ekranı değiştir
        setNeedsVerification(true);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 w-full h-full bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse transition-all duration-1000 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl opacity-50 animate-pulse transition-all duration-1000 mix-blend-screen delay-700"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 mb-4 shadow-xl shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-white mb-2 tracking-tight">
            Aura <span className="text-zinc-400 font-sans font-light">Analyzer</span>
          </h1>
          <p className="text-zinc-400 text-sm">Kişisel renk paletinizi keşfedin</p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-medium text-white tracking-tight">
              {needsVerification 
                ? 'E-postanızı Doğrulayın' 
                : isLogin ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {needsVerification
                ? `${email} adresine gönderilen 6 haneli kodu girin.`
                : isLogin 
                  ? 'Renk profilinize erişmek için e-posta ve şifrenizi girin.'
                  : 'Kişisel analizlerinizi kaydetmek için ücretsiz kayıt olun.'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {needsVerification ? (
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-zinc-300">Doğrulama Kodu</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="123456" 
                      required 
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="pl-9 bg-white/5 border-white/10 text-white tracking-widest text-center text-lg focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">E-posta adresi</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="ornek@email.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-zinc-300">Şifre</Label>
                      {isLogin && (
                        <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                          Şifremi unuttum
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <Input 
                        id="password" 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {needsVerification 
                  ? 'Kodu Doğrula' 
                  : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </Button>
              
              {!needsVerification && (
                <div className="text-center text-sm text-zinc-400">
                  {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 text-purple-400 hover:text-purple-300 hover:underline transition-colors focus:outline-none"
                  >
                    {isLogin ? 'Şimdi oluşturun' : 'Giriş yapın'}
                  </button>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

