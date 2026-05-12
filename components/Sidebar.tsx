'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calculator, History, Settings, LogOut, BookOpen, BarChart2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { name: 'KPIs', href: '/kpi', icon: BarChart2 },
    { name: t('nav.estimate'), href: '/estimate', icon: Calculator },
    { name: t('nav.quotes'), href: '/history', icon: FileText },
    { name: t('nav.leads'), href: '/leads', icon: History },
    { name: 'Sales Playbook', href: '/playbook', icon: BookOpen },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full shadow-xl hidden md:flex">
      <div className="p-6 flex flex-col items-center justify-center border-b border-zinc-800/50 gap-4">
        <Image 
          src="https://img1.wsimg.com/isteam/ip/97a5d835-7b16-4991-b3c6-3d6956b6b82b/ESBOC%CC%A7O-STAR-CLEANING_full.png" 
          alt="Star Cleaning SC" 
          width={180} 
          height={90} 
          className="object-contain"
          referrerPolicy="no-referrer"
          priority
        />
        
        {/* Language Selector */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg w-full">
          <button 
            onClick={() => setLanguage('en')}
            className={cn(
              "flex-1 px-3 py-1.5 text-[10px] font-bold rounded-md transition-all",
              language === 'en' ? "bg-sky-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            ENGLISH
          </button>
          <button 
            onClick={() => setLanguage('pt')}
            className={cn(
              "flex-1 px-3 py-1.5 text-[10px] font-bold rounded-md transition-all",
              language === 'pt' ? "bg-sky-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            PORTUGUÊS
          </button>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm",
                isActive 
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"
              )}
            >
              <Icon size={18} className={isActive ? 'text-sky-400' : 'text-zinc-500'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs uppercase">
            {user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-zinc-200 truncate">{language === 'en' ? 'User' : 'Usuário'}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          {language === 'en' ? 'Sign Out' : 'Sair'}
        </button>
      </div>
    </div>
  );
}
