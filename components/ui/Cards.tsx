'use client';

import { Check } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function ServiceCard({ title, description, icon, selected, onClick }: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all duration-200 w-full",
        selected 
          ? "border-sky-500 bg-sky-500/5 shadow-sm shadow-sky-500/10" 
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      )}
    >
      <div className={cn(
        "p-3 rounded-lg mb-4 transition-colors",
        selected ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "bg-zinc-100 text-zinc-500"
      )}>
        {icon}
      </div>
      <h3 className={cn("font-bold text-lg mb-1", selected ? "text-sky-950" : "text-zinc-800")}>{title}</h3>
      <p className={cn("text-sm", selected ? "text-sky-700/80" : "text-zinc-500")}>{description}</p>
      
      {selected && (
        <div className="absolute top-4 right-4 bg-sky-500 text-white p-1 rounded-full shadow-sm">
          <Check size={14} strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

interface ExtraCardProps {
  title: string;
  price: number;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function ExtraCard({ title, price, icon, selected, onClick }: ExtraCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 w-full",
        selected 
          ? "border-sky-500 bg-sky-500/5 shadow-sm shadow-sky-500/10" 
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-lg transition-colors",
          selected ? "bg-sky-100 text-sky-600" : "bg-zinc-100 text-zinc-500"
        )}>
          {icon}
        </div>
        <div className="text-left">
          <h4 className={cn("font-semibold text-sm", selected ? "text-sky-950" : "text-zinc-800")}>{title}</h4>
          <p className="text-xs font-medium text-zinc-500 mt-0.5">+${price}</p>
        </div>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
        selected ? "bg-sky-500 border-sky-500 text-white" : "border-zinc-300 bg-white"
      )}>
        {selected && <Check size={12} strokeWidth={4} />}
      </div>
    </button>
  );
}
