import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Home, Clock, Sparkles, Settings, CreditCard, Menu, X } from 'lucide-react'
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
    <div className="min-h-screen bg-transparent flex font-sans">
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 left-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white ">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">Aura Analyzer</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-foreground hover:text-foreground hover:bg-transparent transition-all group">
            <Home className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            Dashboard
          </Link>
          <Link href="/dashboard/history" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-foreground hover:text-foreground hover:bg-transparent transition-all group">
            <Clock className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            Geçmiş Analizler
          </Link>
          <Link href="/dashboard/pricing" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-foreground hover:text-foreground hover:bg-transparent transition-all group">
            <CreditCard className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            Fiyatlandırma
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-foreground truncate">Hesabım</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
            <form action="/auth/signout" method="post">
              <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">Aura</span>
          </div>
          <button className="p-2 text-muted-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
