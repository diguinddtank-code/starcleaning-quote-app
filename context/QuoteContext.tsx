'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QuoteState, SavedQuote } from '@/lib/types';
import { useSettings } from './SettingsContext';
import { supabase, hasSupabase } from '@/lib/supabase';
import { useLead } from './LeadContext';

interface QuoteContextType {
  quote: QuoteState;
  updateQuote: (updates: Partial<QuoteState>) => void;
  totalPrice: number;
  saveQuoteToLead: (leadId?: string, customerName?: string, customerPhone?: string, customerEmail?: string) => Promise<SavedQuote>;
  resetQuote: () => void;
  savedQuotes: SavedQuote[];
  deleteQuote: (id: string) => Promise<void>;
}

const defaultQuote: QuoteState = {
  sqFt: 1500,
  beds: 3,
  baths: 2,
  halfBaths: 0,
  bedsToChange: 0,
  serviceType: 'residential',
  frequency: 'one-time',
  selectedExtras: [],
};

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [quote, setQuote] = useState<QuoteState>(defaultQuote);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const { settings } = useSettings();
  const { leads, updateLead, addLead } = useLead();

  useEffect(() => {
    let subscription: any = null;

    const loadQuotes = async () => {
      if (hasSupabase && supabase) {
        try {
          const { data, error } = await supabase
            .from('quotes')
            .select('*');

          if (data && !error) {
            // Map DB format to SavedQuote
            const mapped = data.map(q => ({
              id: q.id,
              date: q.created_at,
              leadId: q.lead_id,
              customerName: q.customer_name,
              customerPhone: q.customer_phone,
              customerEmail: q.customer_email,
              sqFt: q.sq_ft,
              beds: q.beds,
              baths: q.baths,
              halfBaths: q.half_baths,
              bedsToChange: q.beds_to_change || 0,
              serviceType: q.service_type as any,
              frequency: q.frequency as any,
              total: q.total,
              status: q.status,
              selectedExtras: q.selected_extras || []
            }));
            setSavedQuotes(mapped);
          }
        } catch (error) {
          console.error("Failed to load quotes:", error);
        }

        subscription = supabase
          .channel(`quotes_changes_${Math.random()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
            // Simple refetch, or we can handle payload. Too long payload.
            loadQuotes();
          })
          .subscribe();
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
    const sqFt = quote.sqFt;
    let tier = settings.pricingTiers?.find(t => sqFt >= t.minSqft && sqFt <= t.maxSqft);
    if (!tier && settings.pricingTiers && settings.pricingTiers.length > 0) {
      tier = settings.pricingTiers.reduce((prev, curr) => 
        Math.abs(curr.maxSqft - sqFt) < Math.abs(prev.maxSqft - sqFt) ? curr : prev
      );
    }

    let total = settings.basePrice;
    
    if (tier) {
      // Find best match in details by beds
      const matches = [...tier.details].sort((a,b) => a.beds - b.beds);
      let detail = matches[0];
      for (const d of matches) {
          if (quote.beds <= d.beds) {
              detail = d;
              break;
          }
      }
      if (!detail) detail = matches[matches.length - 1];

      if (quote.frequency !== 'one-time') {
         if (quote.frequency === 'weekly') total = tier.recurring.weekly.max;
         else if (quote.frequency === 'bi-weekly') total = tier.recurring.biWeekly.max;
         else if (quote.frequency === 'monthly') total = tier.recurring.monthly.max;
      } else {
         if (quote.serviceType === 'deep') total = detail.deep.max;
         else if (quote.serviceType === 'move') total = detail.moveInOut.max;
         else if (quote.serviceType === 'residential') total = detail.general.max;
         else {
             // fallback baseline
             total = detail.general.max;
         }
      }

      // Apply legacy multipliers for types not covered by tier spreadsheet
      if (quote.frequency === 'one-time') {
         if (quote.serviceType === 'vacation') total *= settings.vacationMultiplier;
         else if (quote.serviceType === 'commercial') total *= settings.commercialMultiplier;
         else if (quote.serviceType === 'construction') total *= settings.constructionMultiplier;
      }
    } else {
      // Legacy basic fallback 
      total += quote.sqFt * settings.pricePerSqFt;
      total += quote.beds * settings.bedPrice;
      total += quote.baths * settings.bathPrice;
      total += quote.halfBaths * settings.halfBathPrice;

      if (quote.serviceType === 'deep') total *= settings.deepCleanMultiplier;
      else if (quote.serviceType === 'move') total *= settings.moveInOutMultiplier;
      else if (quote.serviceType === 'vacation') total *= settings.vacationMultiplier;
      else if (quote.serviceType === 'commercial') total *= settings.commercialMultiplier;
      else if (quote.serviceType === 'construction') total *= settings.constructionMultiplier;

      if (quote.frequency === 'weekly') total *= settings.weeklyMultiplier;
      else if (quote.frequency === 'bi-weekly') total *= settings.biWeeklyMultiplier;
      else if (quote.frequency === 'monthly') total *= settings.monthlyMultiplier;
    }

    // Bed changing logic: 1st bed is free!
    if (quote.bedsToChange && quote.bedsToChange > 1) {
      total += (quote.bedsToChange - 1) * (settings.extras?.bedChange || 10);
    }

    quote.selectedExtras.forEach((extra) => {
      if (extra in settings.extras) {
        total += settings.extras[extra as keyof typeof settings.extras];
      }
    });

    return Math.round(total);
  };

  const totalPrice = calculateTotal();

  const saveQuoteToLead = async (leadId?: string, customerName?: string, customerPhone?: string, customerEmail?: string): Promise<SavedQuote> => {
    const qid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const newQuote: SavedQuote = {
      ...quote,
      id: qid,
      date: new Date().toISOString(),
      total: totalPrice,
      customerName,
      customerPhone,
      customerEmail,
      status: 'new',
    };

    if (hasSupabase && supabase) {
      const { data: userAuth } = await supabase.auth.getUser();
      const userEmail = userAuth?.user?.email || null;
      let finalLeadId = leadId;

      if (leadId) {
        // We attach this estimate details to an existing lead by updating ETAPA and Prices
        await updateLead(leadId, {
          Inicial: `$${totalPrice}`,
          OBSERVACOES: `Estimated ${quote.serviceType} / ${quote.sqFt}sqft. Total: $${totalPrice}`,
          ETAPA: 'cotado'
        });
      } else {
        // Create a new Lead
        const newLead = await addLead({
          Nome: customerName,
          Telefone: customerPhone,
          Email: customerEmail,
          Quartos: quote.beds.toString(),
          Banheiros: (quote.baths + quote.halfBaths).toString(),
          Service: quote.serviceType,
          Frequencia: quote.frequency,
          Inicial: `$${totalPrice}`,
          ETAPA: 'novo',
          created_by_email: userEmail
        } as any);
        if (newLead) {
          finalLeadId = newLead.id;
        }
      }

      newQuote.leadId = finalLeadId;

      // Insert Quote
      await supabase.from('quotes').insert({
        id: qid,
        lead_id: finalLeadId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        sq_ft: quote.sqFt,
        beds: quote.beds,
        baths: quote.baths,
        half_baths: quote.halfBaths,
        beds_to_change: quote.bedsToChange,
        selected_extras: quote.selectedExtras,
        service_type: quote.serviceType,
        frequency: quote.frequency,
        total: totalPrice,
        status: 'new'
      });
    }

    // Optimistically push the new quote to the local estimates list
    setSavedQuotes((prev) => {
      const exists = prev.some(q => q.id === qid);
      if (exists) return prev;
      return [newQuote, ...prev];
    });
    
    return newQuote;
  };

  const deleteQuote = async (id: string) => {
    // Optimistic
    setSavedQuotes(prev => prev.filter(q => q.id !== id));
    
    if (hasSupabase && supabase) {
      try {
        await supabase.from('quotes').delete().eq('id', id);
      } catch (e) {
        console.error("Failed to delete quote", e);
      }
    }
  };

  return (
    <QuoteContext.Provider
      value={{ quote, updateQuote, totalPrice, saveQuoteToLead, resetQuote, savedQuotes, deleteQuote }}
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
