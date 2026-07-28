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
      // 1. Fetch offline quotes
      let localQuotes: SavedQuote[] = [];
      try {
        localQuotes = JSON.parse(localStorage.getItem('offline_quotes') || '[]');
      } catch(e) {}
      
      let fetchedQuotes: SavedQuote[] = [];

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
            
            // Auto-sync completely offline quotes
            if (localQuotes.length > 0) {
              const stillOffline: SavedQuote[] = [];
              for (const lq of localQuotes) {
                const essentialQuoteData: any = {
                  lead_id: lq.leadId,
                  customer_name: lq.customerName,
                  customer_phone: lq.customerPhone,
                  customer_email: lq.customerEmail,
                  total: lq.total,
                  service_type: lq.serviceType,
                  frequency: lq.frequency,
                  sq_ft: lq.sqFt,
                  beds: lq.beds,
                  baths: lq.baths,
                  half_baths: lq.halfBaths,
                  beds_to_change: lq.bedsToChange,
                  status: 'new',
                  created_by_email: userEmail
                };
                
                // We'll omit 'id' since it's going to be a new insert with DB auto-generation.
                const { error: syncErr } = await supabase.from('quotes').insert(essentialQuoteData);
                if (syncErr) {
                   stillOffline.push(lq);
                }
              }
              localQuotes = stillOffline;
              localStorage.setItem('offline_quotes', JSON.stringify(localQuotes));
            }
          }

          const { data, error } = await query;

          if (data && !error) {
            // Map DB format to SavedQuote
            fetchedQuotes = data.map(q => ({
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
              manualDiscount: q.manual_discount || 0,
              manualIncrease: q.manual_increase || 0
            }));
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
      
      // Combine local offline queries with DB ones
      const combined = [...localQuotes, ...fetchedQuotes];
      // Dedup by basic matching if needed, though they shouldn't clash if DB generates IDs.
      // Sort by newest
      combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setSavedQuotes(combined);
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
         if (quote.serviceType === 'ttb') total = detail.deep.max;
         else if (quote.serviceType === 'deep') total = detail.general.max;
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

      if (quote.serviceType === 'ttb') total *= settings.deepCleanMultiplier;
      else if (quote.serviceType === 'deep') total *= 1.2;
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
    if (quote.manualIncrease && quote.manualIncrease > 0) {
      finalTotal += quote.manualIncrease;
    }
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
    
    let finalCustomerName = customerName || '';
    let finalCustomerPhone = customerPhone || '';
    let finalCustomerEmail = customerEmail || '';

    if (leadId && leads) {
      const existingLead = leads.find(l => l.id === leadId);
      if (existingLead) {
        if (!finalCustomerName) finalCustomerName = existingLead.Nome || '';
        if (!finalCustomerPhone) finalCustomerPhone = existingLead.Telefone || '';
        if (!finalCustomerEmail) finalCustomerEmail = existingLead.Email || '';
      }
    }

    const newQuote: SavedQuote = {
      ...quote,
      id: qid,
      date: new Date().toISOString(),
      total: totalPrice,
      leadId,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerEmail: finalCustomerEmail,
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
          Nome: finalCustomerName,
          Telefone: finalCustomerPhone,
          Email: finalCustomerEmail,
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
          newQuote.leadId = finalLeadId;
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
      const fullQuoteData: any = {
        lead_id: finalLeadId,
        customer_name: finalCustomerName,
        customer_phone: finalCustomerPhone,
        customer_email: finalCustomerEmail,
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
        manual_increase: quote.manualIncrease || 0,
        status: 'new',
        created_by_email: userEmail
      };

      let { data: insertedQuote, error: insertError } = await supabase.from('quotes').insert(fullQuoteData).select().single();
      
      if (insertError) {
        console.warn('First insert attempt failed. Retrying with essential schema columns.', insertError);
        const essentialQuoteData: any = {
          lead_id: finalLeadId,
          customer_name: finalCustomerName,
          customer_phone: finalCustomerPhone,
          customer_email: finalCustomerEmail,
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
        const { data: retryData, error: retryError } = await supabase.from('quotes').insert(essentialQuoteData).select().single();
        if (retryError) {
          console.error('Failed both insert attempts in Supabase quotes table:', retryError);
          // 4. Save entire object to offline array
          const offline = JSON.parse(localStorage.getItem('offline_quotes') || '[]');
          offline.push(newQuote);
          localStorage.setItem('offline_quotes', JSON.stringify(offline));
        } else {
          insertedQuote = retryData;
        }
      }

      if (insertedQuote && insertedQuote.id) {
        newQuote.id = insertedQuote.id;
        if (!userEmail) {
          const anonQuotes = JSON.parse(localStorage.getItem('anon_quotes') || '[]');
          anonQuotes.push(insertedQuote.id);
          localStorage.setItem('anon_quotes', JSON.stringify(anonQuotes));
        }
      }
    }

    // Optimistically push the new quote to the local estimates list
    setSavedQuotes((prev) => {
      const exists = prev.some(q => q.id === newQuote.id);
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
