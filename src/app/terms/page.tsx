import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent py-24 px-6 relative z-10 flex flex-col items-center">
      <div className="max-w-3xl w-full mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      <div className="max-w-3xl w-full bg-card border border-border p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl md:text-5xl font-semibold mb-8 text-foreground tracking-tight">Terms of Service</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. Scope of the Service</h2>
          <p>
            Aura Photo Booth is a platform that analyzes users' facial features, skin and hair colors through
            artificial intelligence to provide personal color palettes and style recommendations. All analyses
            are advisory in nature and do not constitute definitive or professional medical guidance.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. User Responsibilities</h2>
          <p>
            When using the platform, you must ensure that the photos you upload belong to you or that you hold
            the necessary usage rights. Uploading inappropriate, illegal or copyright-infringing images may
            result in your account being terminated without prior warning.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Subscriptions and Billing</h2>
          <p>
            Our platform offers monthly and yearly subscription plans (Monthly $39.99 / Yearly $89.90).
            You can cancel your subscription at any time from your account settings. Yearly subscriptions
            that are not canceled within the 7-day free trial period will be billed. Canceled subscriptions
            remain active until the end of the current billing period.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">4. Changes to the Service</h2>
          <p>
            Aura Photo Booth reserves the right to modify its algorithms, pricing and terms of use without
            prior notice. Important updates will be communicated to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
