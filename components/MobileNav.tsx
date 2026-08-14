'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {  LayoutDashboard, Calculator, History, Settings, LogOut, BookOpen, BarChart2, FileText , Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function MobileNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { t, language } = useLanguage();

  if (pathname === '/estimate/view') return null;

  const navItems = [
    { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav.estimate'), href: '/estimate', icon: Calculator },
    { name: t('nav.quotes'), href: '/history', icon: FileText },
    { name: t('nav.leads'), href: '/leads', icon: History },
    { name: language === 'en' ? 'Campaigns' : 'Campanhas', href: '/campanhas', icon: Megaphone },
    { name: 'KPIs', href: '/kpi', icon: BarChart2 },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around p-2 pb-safe z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[64px] transition-colors",
              isActive ? "text-sky-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon size={20} className={isActive ? 'text-sky-400' : 'text-zinc-500'} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
      <button
        onClick={signOut}
        className="flex flex-col items-center gap-1 p-2 rounded-lg min-w-[64px] transition-colors text-zinc-500 hover:text-zinc-300"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium">Exit</span>
      </button>
    </div>
  );
}
