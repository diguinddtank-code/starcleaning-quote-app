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
        "flex flex-col p-4 sm:p-5 text-left rounded-xl border-2 transition-all duration-200 h-full w-full hover:-translate-y-1",
        selected 
          ? "border-sky-500 bg-sky-50 shadow-sm shadow-sky-500/20 ring-1 ring-sky-500/20" 
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-xl transition-colors mb-3 w-fit",
        selected ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "bg-zinc-100 text-zinc-500"
      )}>
        {icon}
      </div>
      <h3 className={cn("font-bold text-base leading-tight mb-1", selected ? "text-sky-950" : "text-zinc-800")}>{title}</h3>
      <p className={cn("text-sm leading-snug", selected ? "text-sky-700/80" : "text-zinc-500")}>{description}</p>
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
        "flex flex-col sm:flex-row items-center sm:items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 w-full hover:-translate-y-0.5",
        selected 
          ? "border-sky-500 bg-sky-50 shadow-sm shadow-sky-500/20 ring-1 ring-sky-500/20" 
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-3 w-full">
        <div className={cn(
          "p-2.5 rounded-xl transition-colors shrink-0",
          selected ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "bg-zinc-100 text-zinc-500"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={cn("font-semibold text-sm", selected ? "text-sky-950" : "text-zinc-800")}>{title}</h4>
          <p className="text-xs font-medium text-zinc-500 mt-0.5">+${price}</p>
        </div>
      </div>
    </button>
  );
}
