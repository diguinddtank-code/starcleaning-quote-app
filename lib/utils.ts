import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isLeadStageClosed(stage?: string | null): boolean {
  if (!stage) return false;
  const s = stage.toLowerCase();
  return (
    s.includes('closing') || 
    s.includes('closed') || 
    s.includes('fechado') || 
    s.includes('fechamento') || 
    s.includes('agendado') || 
    s.includes('scheduled') || 
    s.includes('scheduling') ||
    s.includes('agendou') ||
    s.includes('confirm') || 
    s.includes('ganho') || 
    s.includes('won')
  );
}
