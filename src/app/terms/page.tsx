import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent py-24 px-6 relative z-10 flex flex-col items-center">
      <div className="max-w-3xl w-full mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>
      </div>
      <div className="max-w-3xl w-full bg-card border border-border p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl md:text-5xl font-semibold mb-8 text-foreground tracking-tight">Kullanım Şartları</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. Hizmetin Kapsamı</h2>
          <p>
            Aura Analyzer, kullanıcıların yüz hatlarını ve cilt/saç renklerini yapay zeka aracılığıyla analiz ederek kişisel paletler 
            ve stil tavsiyeleri sunan bir platformdur. Sunulan analizler tavsiye niteliğinde olup kesinlik veya profesyonel medikal 
            bir geçerlilik taşımaz.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. Kullanıcı Sorumlulukları</h2>
          <p>
            Platformu kullanırken yüklediğiniz fotoğrafların size ait olduğundan veya kullanım haklarına sahip olduğunuzdan emin olmalısınız. 
            Uygunsuz, yasa dışı veya telif hakkı ihlali içeren görsellerin yüklenmesi durumunda hesabınız uyarı yapılmaksızın sonlandırılabilir.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Premium Üyelik ve İptal</h2>
          <p>
            Platformumuz aylık veya yıllık abonelik modelleri sunar (Aylık $39 / Yıllık $99). Kullanıcı dilediği zaman 
            ayarlarından aboneliğini iptal edebilir. 7 günlük ücretsiz deneme (Trial) süresi içinde iptal edilmeyen yıllık 
            abonelikler faturalandırılır. İptal edilen abonelikler, geçerli dönemin sonuna kadar kullanılmaya devam eder.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">4. Hizmet Değişiklikleri</h2>
          <p>
            Aura Analyzer, sistem algoritmalarında, fiyatlandırmasında ve kullanım koşullarında önceden haber vermeksizin 
            değişiklik yapma hakkını saklı tutar. Önemli güncellemeler kayıtlı e-posta adresinize bildirilir.
          </p>
        </div>
      </div>
    </div>
  );
}
