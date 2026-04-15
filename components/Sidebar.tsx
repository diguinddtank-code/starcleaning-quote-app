'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calculator, History, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'New Estimate', href: '/estimate', icon: Calculator },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full shadow-xl hidden md:flex">
      <div className="p-6 flex items-center justify-center border-b border-zinc-800/50">
        <Image 
          src="https://img1.wsimg.com/isteam/ip/97a5d835-7b16-4991-b3c6-3d6956b6b82b/ESBOC%CC%A7O-STAR-CLEANING_full.png" 
          alt="Star Cleaning SC" 
          width={180} 
          height={90} 
          className="object-contain"
          referrerPolicy="no-referrer"
          priority
        />
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
            <p className="text-sm font-medium text-zinc-200 truncate">User</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
