'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, LayoutDashboard, Clock, CreditCard, LogOut, Menu, X, Sparkles } from 'lucide-react';

const links = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/history', label: 'Geçmiş Analizler', icon: Clock },
  { href: '/dashboard/pricing', label: 'Fiyatlandırma', icon: CreditCard },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden bg-card border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">Aura</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="px-4 pb-4 space-y-1 border-t border-border pt-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-foreground hover:bg-accent transition-all group"
            >
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              {label}
            </Link>
          ))}
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
