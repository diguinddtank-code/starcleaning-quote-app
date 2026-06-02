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
  serviceType: 'deep',
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
          const { data: userAuth } = await supabase.auth.getUser();
          const userEmail = userAuth?.user?.email || null;
          
          let query = supabase.from('quotes').select('*');
          if (userEmail) {
            // Auto-sync anonymous quotes/leads
            const anonQuotes = JSON.parse(localStorage.getItem('anon_quotes') || '[]');
            if (anonQuotes.length > 0) {
              await supabase.from('quotes').update({ created_by_email: userEmail }).in('id', anonQuotes);
              localStorage.removeItem('anon_quotes');
            }
            
            const anonLeads = JSON.parse(localStorage.getItem('anon_leads') || '[]');
            if (anonLeads.length > 0) {
              await supabase.from('leads').update({ created_by_email: userEmail }).in('id', anonLeads);
              localStorage.removeItem('anon_leads');
            }
          }

          const { data, error } = await query;

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
              selectedExtras: q.selected_extras || [],
              militaryDiscount: q.military_discount || false,
              manualDiscount: q.manual_discount || 0
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

    // Sheet changing logic (Extra): 1st bed is free, $10 per additional bed
    if (quote.selectedExtras.includes('sheetChange')) {
      const additionalBeds = Math.max(0, quote.beds - 1);
      if (additionalBeds > 0) {
        // Fallback to 10 if not defined in settings
        total += additionalBeds * (settings.extras?.sheetChange || 10);
      }
    }

    quote.selectedExtras.forEach((extra) => {
      if (extra !== 'sheetChange' && extra in settings.extras) {
        total += settings.extras[extra as keyof typeof settings.extras] || 0;
      }
    });

    let finalTotal = Math.round(total);
    if (quote.militaryDiscount) {
      finalTotal = Math.round(finalTotal * 0.9);
    }
    if (quote.manualDiscount && quote.manualDiscount > 0) {
      finalTotal = Math.max(0, finalTotal - quote.manualDiscount);
    }
    return finalTotal;
  };

  const totalPrice = calculateTotal();

  const saveQuoteToLead = async (leadId?: string, customerName?: string, customerPhone?: string, customerEmail?: string): Promise<SavedQuote> => {
    const qid = Math.floor(100000 + Math.random() * 900000).toString();
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
          if (!userEmail) {
            const anonLeads = JSON.parse(localStorage.getItem('anon_leads') || '[]');
            if (!anonLeads.includes(finalLeadId)) {
              anonLeads.push(finalLeadId);
              localStorage.setItem('anon_leads', JSON.stringify(anonLeads));
            }
          }
        }
      }

      newQuote.leadId = finalLeadId;

      // Insert Quote
      const fullQuoteData = {
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
        military_discount: quote.militaryDiscount || false,
        manual_discount: quote.manualDiscount || 0,
        status: 'new',
        created_by_email: userEmail
      };

      const { error: insertError } = await supabase.from('quotes').insert(fullQuoteData);
      
      if (insertError) {
        console.warn('First insert attempt failed (likely due to missing selected_extras column). Retrying with essential schema columns.', insertError);
        const essentialQuoteData = {
          id: qid,
          lead_id: finalLeadId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          sq_ft: quote.sqFt,
          beds: quote.beds,
          baths: quote.baths,
          half_baths: quote.halfBaths,
          service_type: quote.serviceType,
          frequency: quote.frequency,
          total: totalPrice,
          status: 'new',
          created_by_email: userEmail
        };
        const { error: retryError } = await supabase.from('quotes').insert(essentialQuoteData);
        if (retryError) {
          console.error('Failed both insert attempts in Supabase quotes table:', retryError);
        } else {
          console.log('Successfully saved quote to Supabase using essential schema columns.');
          if (!userEmail) {
            const anonQuotes = JSON.parse(localStorage.getItem('anon_quotes') || '[]');
            anonQuotes.push(qid);
            localStorage.setItem('anon_quotes', JSON.stringify(anonQuotes));
          }
        }
      } else {
        console.log('Successfully saved quote to Supabase with full schema columns.');
        if (!userEmail) {
          const anonQuotes = JSON.parse(localStorage.getItem('anon_quotes') || '[]');
          anonQuotes.push(qid);
          localStorage.setItem('anon_quotes', JSON.stringify(anonQuotes));
        }
      }
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
