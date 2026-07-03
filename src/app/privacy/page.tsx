import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent py-24 px-6 relative z-10 flex flex-col items-center">
      <div className="max-w-3xl w-full mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>
      </div>
      <div className="max-w-3xl w-full bg-card border border-border p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl md:text-5xl font-semibold mb-8 text-foreground tracking-tight">Gizlilik Politikası</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. Toplanan Veriler</h2>
          <p>
            Aura Photo Booth olarak, sunduğumuz yapay zeka destekli renk analizi hizmetini en iyi şekilde gerçekleştirebilmek için 
            kullanıcılarımızın yüklediği fotoğrafları, e-posta adreslerini ve kullanım istatistiklerini geçici veya kalıcı olarak saklayabiliriz. 
            Yüklediğiniz fotoğraflar sadece analiz amacıyla kullanılır ve 3. parti izinsiz kişilerle paylaşılmaz.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. Verilerin Kullanımı</h2>
          <p>
            Toplanan veriler yalnızca size daha doğru kişisel kombin, makyaj önerileri ve TikTok trendleri sunabilmek için işlenir. 
            Ayrıca, iletişim bilgileriniz sizlere sistem güncellemeleri ve fırsatları bildirmek üzere kullanılabilir.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Çerezler (Cookies)</h2>
          <p>
            Platform deneyiminizi geliştirmek ve oturumunuzu açık tutmak için çerezlerden yararlanıyoruz. Tarayıcı ayarlarınızdan çerezleri 
            dilediğiniz zaman kapatabilirsiniz.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">4. Güvenlik ve RLS (Row Level Security)</h2>
          <p>
            Veritabanımızda yüksek güvenlik standartlarına sahip Supabase altyapısı ve RLS (Satır Bazlı Güvenlik) kuralları uygulanmaktadır. 
            Bu sayede her kullanıcı yalnızca kendi verisine ve paletine erişebilir. Kötü niyetli erişimlerin önüne geçmek için 
            şifreleme yöntemleri kullanıyoruz.
          </p>
        </div>
      </div>
    </div>
  );
}
