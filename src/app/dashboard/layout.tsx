import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl tracking-tight">Aura <span className="font-sans font-light text-zinc-400">Analyzer</span></span>
          </Link>
          
          <div className="flex flex-1 items-center justify-between ml-8">
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Yeni Analiz
              </Link>
              <Link href="/dashboard/history" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Geçmiş Analizlerim
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400 hidden sm:inline-block">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}
