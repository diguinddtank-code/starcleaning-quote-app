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
  updateLead: (id: string, updates: Partial<SavedQuote>) => Promise<void>;
  deleteQuote: (id: string) => void;
  resetQuote: () => void;
}

const defaultQuote: QuoteState = {
  sqFt: 1500,
  beds: 3,
  baths: 2,
  halfBaths: 0,
  serviceType: 'residential',
  frequency: 'one-time',
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
              frequency: q.frequency || 'one-time',
              selectedExtras: q.selected_extras || [],
              total: Number(q.total),
              customerName: q.customer_name,
              customerPhone: q.customer_phone,
              customerEmail: q.customer_email,
              customerAddress: q.customer_address,
              notes: q.notes,
              status: q.status || 'new',
              createdByEmail: q.created_by_email,
            }));
            setSavedQuotes(mappedQuotes);
          }

          // Automatically sync local data if any exists
          const localData = localStorage.getItem('starCleaningHistory');
          if (localData) {
            try {
              const localQuotes: SavedQuote[] = JSON.parse(localData);
              if (localQuotes.length > 0) {
                const { data: userAuth } = await supabase.auth.getUser();
                const user = userAuth?.user;
                
                const quotesToInsert = localQuotes.map(quote => ({
                  created_at: quote.date || new Date().toISOString(),
                  sq_ft: quote.sqFt,
                  beds: quote.beds,
                  baths: quote.baths,
                  half_baths: quote.halfBaths,
                  service_type: quote.serviceType,
                  frequency: quote.frequency || 'one-time',
                  selected_extras: quote.selectedExtras || [],
                  total: quote.total,
                  customer_name: quote.customerName || null,
                  customer_phone: quote.customerPhone || null,
                  status: quote.status || 'new',
                  created_by_email: user?.email || null,
                }));

                const { error: syncError } = await supabase.from('quotes').insert(quotesToInsert);
                if (!syncError) {
                  localStorage.removeItem('starCleaningHistory');
                  console.log('Successfully synced local quotes to Supabase!');
                } else {
                  console.error('Error syncing local quotes', syncError);
                }
              }
            } catch (e) {
              console.error('Failed to parse or sync local quotes', e);
            }
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
                frequency: q.frequency || 'one-time',
                selectedExtras: q.selected_extras || [],
                total: Number(q.total),
                customerName: q.customer_name,
                customerPhone: q.customer_phone,
                customerEmail: q.customer_email,
                customerAddress: q.customer_address,
                notes: q.notes,
                status: q.status || 'new',
                createdByEmail: q.created_by_email,
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
                frequency: q.frequency || 'one-time',
                selectedExtras: q.selected_extras || [],
                total: Number(q.total),
                customerName: q.customer_name,
                customerPhone: q.customer_phone,
                customerEmail: q.customer_email,
                customerAddress: q.customer_address,
                notes: q.notes,
                status: q.status || 'new',
                createdByEmail: q.created_by_email,
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

    if (quote.frequency === 'weekly') {
      total *= 0.80;
    } else if (quote.frequency === 'bi-weekly') {
      total *= 0.85;
    } else if (quote.frequency === 'monthly') {
      total *= 0.90;
    }

    return Math.round(total);
  };

  const totalPrice = calculateTotal();

  const saveQuote = async (customerName?: string, customerPhone?: string): Promise<SavedQuote> => {
    let newQuote: SavedQuote;

    if (hasSupabase && supabase) {
      try {
        const { data: userAuth } = await supabase.auth.getUser();
        const userEmail = userAuth?.user?.email || undefined;

        const { data, error } = await supabase.from('quotes').insert({
          sq_ft: quote.sqFt,
          beds: quote.beds,
          baths: quote.baths,
          half_baths: quote.halfBaths,
          service_type: quote.serviceType,
          frequency: quote.frequency,
          selected_extras: quote.selectedExtras,
          total: totalPrice,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          status: 'new',
          created_by_email: userEmail,
        }).select().single();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }

        newQuote = {
          ...quote,
          id: data.id,
          date: data.created_at,
          total: totalPrice,
          customerName,
          customerPhone,
          status: 'new',
        };
      } catch (e) {
        console.error('Failed to save quote to Supabase', e);
        // Fallback to local generation if Supabase fails
        const quoteId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        newQuote = {
          ...quote,
          id: quoteId,
          date: new Date().toISOString(),
          total: totalPrice,
          customerName,
          customerPhone,
          status: 'new',
        };
      }
    } else {
      const quoteId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      newQuote = {
        ...quote,
        id: quoteId,
        date: new Date().toISOString(),
        total: totalPrice,
        customerName,
        customerPhone,
        status: 'new',
      };
      localStorage.setItem('starCleaningHistory', JSON.stringify([newQuote, ...savedQuotes]));
    }

    // Optimistic update
    setSavedQuotes((prev) => [newQuote, ...prev]);
    
    return newQuote;
  };

  const updateLead = async (id: string, updates: Partial<SavedQuote>) => {
    // Optimistic update
    setSavedQuotes((prev) => prev.map((q) => q.id === id ? { ...q, ...updates } : q));

    if (hasSupabase && supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
        if (updates.customerPhone !== undefined) dbUpdates.customer_phone = updates.customerPhone;
        if (updates.customerEmail !== undefined) dbUpdates.customer_email = updates.customerEmail;
        if (updates.customerAddress !== undefined) dbUpdates.customer_address = updates.customerAddress;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        const { error } = await supabase.from('quotes').update(dbUpdates).eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to update lead in Supabase', e);
      }
    } else {
      const updated = savedQuotes.map((q) => q.id === id ? { ...q, ...updates } : q);
      localStorage.setItem('starCleaningHistory', JSON.stringify(updated));
    }
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
      value={{ quote, updateQuote, totalPrice, savedQuotes, saveQuote, updateLead, deleteQuote, resetQuote }}
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
