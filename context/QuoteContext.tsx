'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QuoteState, SavedQuote } from '@/lib/types';
import { useSettings } from './SettingsContext';
import { supabase, hasSupabase } from '@/lib/supabase';

interface QuoteContextType {
  quote: QuoteState;
  updateQuote: (updates: Partial<QuoteState>) => void;
  totalPrice: number;
  savedQuotes: SavedQuote[];
  saveQuote: (customerName?: string, customerPhone?: string) => Promise<SavedQuote>;
  deleteQuote: (id: string) => void;
  resetQuote: () => void;
}

const defaultQuote: QuoteState = {
  sqFt: 1500,
  beds: 3,
  baths: 2,
  halfBaths: 0,
  serviceType: 'residential',
  selectedExtras: [],
};

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [quote, setQuote] = useState<QuoteState>(defaultQuote);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const { settings } = useSettings();

  useEffect(() => {
    let subscription: any = null;

    const loadQuotes = async () => {
      if (hasSupabase && supabase) {
        try {
          const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false });

          if (data && !error) {
            const mappedQuotes: SavedQuote[] = data.map((q: any) => ({
              id: q.id,
              date: q.created_at,
              sqFt: q.sq_ft,
              beds: q.beds,
              baths: q.baths,
              halfBaths: q.half_baths,
              serviceType: q.service_type,
              selectedExtras: q.selected_extras || [],
              total: Number(q.total),
              customerName: q.customer_name,
              customerPhone: q.customer_phone,
            }));
            setSavedQuotes(mappedQuotes);
          }
        } catch (e) {
          console.error('Failed to load quotes from Supabase', e);
        }

        // Subscribe to changes
        subscription = supabase
          .channel(`quotes_changes_${Math.random()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const q = payload.new as any;
              const newQuote: SavedQuote = {
                id: q.id,
                date: q.created_at,
                sqFt: q.sq_ft,
                beds: q.beds,
                baths: q.baths,
                halfBaths: q.half_baths,
                serviceType: q.service_type,
                selectedExtras: q.selected_extras || [],
                total: Number(q.total),
                customerName: q.customer_name,
                customerPhone: q.customer_phone,
              };
              setSavedQuotes((prev) => {
                if (prev.some(p => p.id === newQuote.id)) return prev;
                return [newQuote, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              setSavedQuotes((prev) => prev.filter((q) => q.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
              const q = payload.new as any;
              setSavedQuotes((prev) => prev.map((old) => old.id === q.id ? {
                id: q.id,
                date: q.created_at,
                sqFt: q.sq_ft,
                beds: q.beds,
                baths: q.baths,
                halfBaths: q.half_baths,
                serviceType: q.service_type,
                selectedExtras: q.selected_extras || [],
                total: Number(q.total),
                customerName: q.customer_name,
                customerPhone: q.customer_phone,
              } : old));
            }
          })
          .subscribe();
      } else {
        const saved = localStorage.getItem('starCleaningHistory');
        if (saved) {
          try {
            setSavedQuotes(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse history', e);
          }
        }
      }
    };

    loadQuotes();

    return () => {
      if (subscription) {
        supabase?.removeChannel(subscription);
      }
    };
  }, []);

  const updateQuote = (updates: Partial<QuoteState>) => {
    setQuote((prev) => ({ ...prev, ...updates }));
  };

  const resetQuote = () => {
    setQuote(defaultQuote);
  };

  const calculateTotal = () => {
    let total = settings.basePrice;
    total += quote.sqFt * settings.pricePerSqFt;
    total += quote.beds * settings.bedPrice;
    total += quote.baths * settings.bathPrice;
    total += quote.halfBaths * settings.halfBathPrice;

    if (quote.serviceType === 'deep') {
      total *= settings.deepCleanMultiplier;
    } else if (quote.serviceType === 'move') {
      total *= settings.moveInOutMultiplier;
    } else if (quote.serviceType === 'vacation') {
      total *= settings.vacationMultiplier;
    } else if (quote.serviceType === 'commercial') {
      total *= settings.commercialMultiplier;
    } else if (quote.serviceType === 'construction') {
      total *= settings.constructionMultiplier;
    }

    quote.selectedExtras.forEach((extra) => {
      if (extra in settings.extras) {
        total += settings.extras[extra as keyof typeof settings.extras];
      }
    });

    return Math.round(total);
  };

  const totalPrice = calculateTotal();

  const saveQuote = async (customerName?: string, customerPhone?: string): Promise<SavedQuote> => {
    const quoteId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const dateStr = new Date().toISOString();
    
    const newQuote: SavedQuote = {
      ...quote,
      id: quoteId,
      date: dateStr,
      total: totalPrice,
      customerName,
      customerPhone,
    };

    // Optimistic update
    setSavedQuotes((prev) => [newQuote, ...prev]);

    if (hasSupabase && supabase) {
      try {
        await supabase.from('quotes').insert({
          id: quoteId,
          created_at: dateStr,
          sq_ft: quote.sqFt,
          beds: quote.beds,
          baths: quote.baths,
          half_baths: quote.halfBaths,
          service_type: quote.serviceType,
          selected_extras: quote.selectedExtras,
          total: totalPrice,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        });
      } catch (e) {
        console.error('Failed to save quote to Supabase', e);
      }
    } else {
      localStorage.setItem('starCleaningHistory', JSON.stringify([newQuote, ...savedQuotes]));
    }
    
    return newQuote;
  };

  const deleteQuote = async (id: string) => {
    // Optimistic update
    const updated = savedQuotes.filter((q) => q.id !== id);
    setSavedQuotes(updated);

    if (hasSupabase && supabase) {
      try {
        await supabase.from('quotes').delete().eq('id', id);
      } catch (e) {
        console.error('Failed to delete quote from Supabase', e);
      }
    } else {
      localStorage.setItem('starCleaningHistory', JSON.stringify(updated));
    }
  };

  return (
    <QuoteContext.Provider
      value={{ quote, updateQuote, totalPrice, savedQuotes, saveQuote, deleteQuote, resetQuote }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}
