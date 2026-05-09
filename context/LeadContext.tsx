'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
import { supabase, hasSupabase } from '@/lib/supabase';

interface LeadContextType {
  leads: Lead[];
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let subscription: any = null;

    const loadLeads = async () => {
      if (hasSupabase && supabase) {
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase error loading leads:', error);
          } else if (data) {
            setLeads(data);
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

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    // Optimistic update
    const finalUpdates = { ...updates, updated_at: new Date().toISOString() };
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...finalUpdates } : l));

    if (hasSupabase && supabase) {
      try {
        const { error } = await supabase.from('leads').update(finalUpdates).eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to update lead in Supabase', e);
        // Revert on failure by reloading? For simplicity we just log
      }
    }
  };

  const deleteLead = async (id: string) => {
    // Optimistic update
    setLeads((prev) => prev.filter((l) => l.id !== id));

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
    <LeadContext.Provider value={{ leads, updateLead, deleteLead }}>
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
