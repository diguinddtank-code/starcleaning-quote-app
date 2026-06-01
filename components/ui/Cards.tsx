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
  disabled?: boolean;
}

export function ServiceCard({ title, description, icon, selected, onClick, disabled }: ServiceCardProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col p-4 sm:p-5 text-left rounded-xl border-2 transition-all duration-200 h-full w-full",
        disabled ? "opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-200 grayscale" : "hover:-translate-y-1",
        selected && !disabled
          ? "border-sky-500 bg-sky-50 shadow-sm shadow-sky-500/20 ring-1 ring-sky-500/20" 
          : !disabled && "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
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
  price?: number;
  priceText?: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function ExtraCard({ title, price, priceText, selected, onClick }: Omit<ExtraCardProps, 'icon'>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 w-full hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10",
        selected 
          ? "border-sky-500 bg-sky-50/50 shadow-sm" 
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={cn(
          "w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors duration-200",
          selected ? "bg-sky-500 border-sky-500 text-white" : "border-zinc-300 bg-zinc-50 text-transparent"
        )}>
          <Check strokeWidth={3} className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 text-left flex items-center justify-between">
          <span className={cn("font-semibold text-sm", selected ? "text-sky-950" : "text-zinc-700")}>{title}</span>
          <span className={cn("text-xs font-bold px-2 py-1 rounded-md", selected ? "bg-sky-500/10 text-sky-700" : "bg-zinc-100 text-zinc-500")}>
            {priceText ? priceText : (price !== undefined ? `+$${price}` : '')}
          </span>
        </div>
      </div>
    </button>
  );
}
