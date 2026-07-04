import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent py-24 px-6 relative z-10 flex flex-col items-center">
      <div className="max-w-3xl w-full mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      <div className="max-w-3xl w-full bg-card border border-border p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl md:text-5xl font-semibold mb-8 text-foreground tracking-tight">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. Data We Collect</h2>
          <p>
            At Aura Photo Booth, in order to deliver our AI-powered color analysis service in the best possible way,
            we may store the photos you upload, your email address and usage statistics, either temporarily or permanently.
            Uploaded photos are used solely for analysis purposes and are never shared with unauthorized third parties.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. How We Use Your Data</h2>
          <p>
            The data we collect is processed exclusively to provide you with more accurate personal outfit suggestions,
            makeup recommendations and TikTok trends. Your contact information may also be used to notify you about
            system updates and special offers.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Cookies</h2>
          <p>
            We use cookies to improve your experience on the platform and to keep your session active.
            You can disable cookies at any time from your browser settings.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">4. Security and RLS (Row Level Security)</h2>
          <p>
            Our database runs on Supabase infrastructure with high security standards, protected by RLS (Row Level Security) rules.
            This means every user can only access their own data and palettes. We also use encryption methods to
            prevent malicious access.
          </p>
        </div>
      </div>
    </div>
  );
}
