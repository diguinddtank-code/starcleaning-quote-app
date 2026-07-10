'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
import { supabase, hasSupabase } from '@/lib/supabase';

interface LeadContextType {
  leads: Lead[];
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<Lead | null>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let subscription: any = null;

    const loadLeads = async () => {
      if (hasSupabase && supabase) {
        try {
          const { data: userAuth } = await supabase.auth.getUser();
          const userEmail = userAuth?.user?.email || null;
          
          let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
          if (userEmail) {
            // Auto-sync anonymous leads
            const anonLeads = JSON.parse(localStorage.getItem('anon_leads') || '[]');
            if (anonLeads.length > 0) {
              await supabase.from('leads').update({ created_by_email: userEmail }).in('id', anonLeads);
              localStorage.removeItem('anon_leads');
            }
            
            // Auto-sync offline leads
            const offlineLeads: any[] = JSON.parse(localStorage.getItem('offline_leads') || '[]');
            if (offlineLeads.length > 0) {
              const stillOffline = [];
              for (const ol of offlineLeads) {
                const olData = { ...ol, created_by_email: userEmail };
                delete olData.id; // Let Supabase assign ID
                const { error: syncErr } = await supabase.from('leads').insert(olData);
                if (syncErr) {
                  const fallbackData = { ...olData };
                  delete fallbackData.REMINDER_DATE;
                  const { error: rErr } = await supabase.from('leads').insert(fallbackData);
                  if (rErr) stillOffline.push(ol);
                }
              }
              localStorage.setItem('offline_leads', JSON.stringify(stillOffline));
            }
          }

          const { data, error } = await query;

          if (error) {
            console.error('Supabase error loading leads:', error);
          } else if (data) {
            let offlineUnsynced = [];
            try {
              offlineUnsynced = JSON.parse(localStorage.getItem('offline_leads') || '[]');
            } catch(e) {}
            
            const combined = [...offlineUnsynced, ...data];
            // sort descending
            combined.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setLeads(combined);
          }
        } catch (e) {
          console.error('Exception loading leads from Supabase', e);
        }

        subscription = supabase
          .channel(`leads_changes_${Math.random()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setLeads((prev) => {
                if (prev.some(l => l.id === payload.new.id)) return prev;
                return [payload.new as Lead, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              setLeads((prev) => prev.filter((l) => l.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
              setLeads((prev) => prev.map((old) => old.id === payload.new.id ? (payload.new as Lead) : old));
            }
          })
          .subscribe();
      }
    };

    loadLeads();

    return () => {
      if (subscription) {
        supabase?.removeChannel(subscription);
      }
    };
  }, []);

  const addLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `temp-${Math.random()}`;
    const newLeadObj: Lead = {
      ...leadData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Optimistic insert
    setLeads((prev) => [newLeadObj, ...prev]);

    if (hasSupabase && supabase) {
      try {
        const { data: userAuth } = await supabase.auth.getUser();
        const userEmail = userAuth?.user?.email || null;
        
        const initialInsertData: any = {
          Nome: leadData.Nome,
          Email: leadData.Email,
          Telefone: leadData.Telefone,
          Cidade: leadData.Cidade,
          ZIP: leadData.ZIP,
          Quartos: leadData.Quartos,
          Banheiros: leadData.Banheiros,
          Service: leadData.Service,
          Frequencia: leadData.Frequencia,
          Inicial: leadData.Inicial,
          Final: leadData.Final,
          ETAPA: leadData.ETAPA || 'New Lead',
          ...(leadData.ETAPA && (leadData.ETAPA.toLowerCase() === 'closing' || leadData.ETAPA.toLowerCase() === 'fechado') ? { converted_at: new Date().toISOString() } : {}),
          OBSERVACOES: leadData.OBSERVACOES,
          FOLLOWUP: leadData.FOLLOWUP,
          UMSG: leadData.UMSG,
          is_promo: leadData.is_promo,
          is_referral: leadData.is_referral,
          REMINDER_DATE: leadData.REMINDER_DATE,
          created_by_email: leadData.created_by_email || userEmail
        };

        let { data, error } = await supabase
          .from('leads')
          .insert(initialInsertData)
          .select()
          .single();

        if (error) {
          console.warn('Initial insert on leads failed, retrying with safer subset...', error);
          const fallbackInsertData = { ...initialInsertData };
          delete fallbackInsertData.REMINDER_DATE;
          delete fallbackInsertData.is_promo;
          
          const retryResult = await supabase
            .from('leads')
            .insert(fallbackInsertData)
            .select()
            .single();
            
          data = retryResult.data;
          error = retryResult.error;
        }

        if (error) throw error;
        
        if (!initialInsertData.created_by_email) {
          const anonLeads = JSON.parse(localStorage.getItem('anon_leads') || '[]');
          anonLeads.push((data as Lead).id);
          localStorage.setItem('anon_leads', JSON.stringify(anonLeads));
        }
        
        // Replace temp lead with DB lead
        setLeads((prev) => prev.map((l) => l.id === tempId ? (data as Lead) : l));
        return data as Lead;
      } catch (e) {
        console.error('Failed to add lead in Supabase', e); // Error is ignored, we save to offline_leads.
        
        let localLeads = [];
        try {
          localLeads = JSON.parse(localStorage.getItem('offline_leads') || '[]');
        } catch(ex) {}
        
        const initialInsertDataWithId = {
          ...leadData,
          id: tempId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ETAPA: leadData.ETAPA || 'New Lead'
        };
        
        localLeads.push(initialInsertDataWithId);
        localStorage.setItem('offline_leads', JSON.stringify(localLeads));
        
        // We leave it in optimistic state `setLeads` because it's stored locally now.
        return initialInsertDataWithId as Lead;
      }
    } else {
      let localLeads = [];
      try {
        localLeads = JSON.parse(localStorage.getItem('offline_leads') || '[]');
      } catch(ex) {}
      
      localLeads.push(newLeadObj);
      localStorage.setItem('offline_leads', JSON.stringify(localLeads));
    }
    return newLeadObj;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    // Optimistic update
    const finalUpdates = { ...updates, updated_at: new Date().toISOString() };
    
    if ('ETAPA' in updates && updates.ETAPA !== undefined) {
      if (updates.ETAPA.toLowerCase() === 'closing' || updates.ETAPA.toLowerCase() === 'fechado') {
        finalUpdates.converted_at = new Date().toISOString();
      }
    }
    
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...finalUpdates } : l));
    
    try {
      let localLeads = JSON.parse(localStorage.getItem('offline_leads') || '[]');
      localLeads = localLeads.map((l: any) => l.id === id ? { ...l, ...finalUpdates } : l);
      localStorage.setItem('offline_leads', JSON.stringify(localLeads));
    } catch(e) {}

    if (hasSupabase && supabase) {
      try {
        const payloadToSend: any = { ...finalUpdates };

        let { error } = await supabase.from('leads').update(payloadToSend).eq('id', id);
        
        if (error) {
          console.warn('Initial update failed, retrying with safer subset (no REMINDER_DATE or updated_at or is_promo)', error);
          const fallbackUpdates: any = { ...payloadToSend };
          delete fallbackUpdates.REMINDER_DATE;
          delete fallbackUpdates.updated_at;
          delete fallbackUpdates.is_promo;
          const { error: retryError } = await supabase.from('leads').update(fallbackUpdates).eq('id', id);
          if (retryError) throw retryError;
        }
      } catch (e) {
        console.error('Failed to update lead in Supabase', e);
      }
    }
  };

  const deleteLead = async (id: string) => {
    // Optimistic update
    setLeads((prev) => prev.filter((l) => l.id !== id));
    
    try {
      let localLeads = JSON.parse(localStorage.getItem('offline_leads') || '[]');
      localLeads = localLeads.filter((l: any) => l.id !== id);
      localStorage.setItem('offline_leads', JSON.stringify(localLeads));
    } catch(e) {}

    if (hasSupabase && supabase) {
      try {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to delete lead from Supabase', e);
      }
    }
  };

  return (
    <LeadContext.Provider value={{ leads, updateLead, deleteLead, addLead }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLead() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
}
