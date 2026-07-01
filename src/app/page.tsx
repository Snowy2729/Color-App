import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
      <div className="absolute inset-0 w-full h-full bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-10 space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight">
          Aura <span className="text-zinc-400 font-sans font-light">Analyzer</span>
        </h1>
        <p className="text-xl text-zinc-400">
          Kişisel renk paletinizi yapay zeka ile saniyeler içinde keşfedin. Doğru renklerle parlayın.
        </p>
        <div className="pt-8 flex gap-4 justify-center">
          <Link href="/login">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-8 py-6 text-lg rounded-full">
              Hemen Başla
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full">
              Panele Git
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
