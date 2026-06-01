'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { QuoteDocument } from '@/components/QuoteDocument';
import { supabase, hasSupabase } from '@/lib/supabase';
import { SavedQuote } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';

function EstimateDetail() {
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get('id') : null;
  const { settings } = useSettings();
  const [quote, setQuote] = useState<SavedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid estimate link.');
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!hasSupabase || !supabase) {
          throw new Error('Database connection is unconfigured.');
        }

        const { data, error: fetchError } = await supabase
          .from('quotes')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Estimate not found.');

        const mapped: SavedQuote = {
          id: data.id,
          date: data.created_at || new Date().toISOString(),
          leadId: data.lead_id,
          customerName: data.customer_name || 'Valued Customer',
          customerPhone: data.customer_phone || '',
          customerEmail: data.customer_email || '',
          customerAddress: data.customer_address || '',
          sqFt: data.sq_ft,
          beds: data.beds,
          baths: data.baths,
          halfBaths: data.half_baths || 0,
          bedsToChange: data.beds_to_change || 0,
          serviceType: data.service_type || 'residential',
          frequency: data.frequency || 'one-time',
          total: data.total || 0,
          status: data.status || 'new',
          selectedExtras: data.selected_extras || [],
          militaryDiscount: data.military_discount || false,
          manualDiscount: data.manual_discount || 0
        };

        setQuote(mapped);
      } catch (err: any) {
        console.error('Error fetching quote:', err);
        setError(err.message || 'Error loading estimate details.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-zinc-50 text-zinc-500 gap-3">
        <Loader2 className="animate-spin text-sky-600" size={32} />
        <span className="font-semibold text-zinc-600 text-sm tracking-wide">Loading Estimate...</span>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-zinc-50 p-6">
        <div className="bg-white border border-zinc-200 shadow-xl rounded-2xl max-w-md p-6 text-center space-y-4">
          <div className="bg-rose-50 border border-rose-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Estimate Access Error</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {error || 'The requested cleaning quotation is not found or has been removed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100/50 py-8 px-4 sm:px-6 lg:px-8">
      <QuoteDocument quote={quote} settings={settings} showAdminControls={false} />
    </div>
  );
}

export default function EstimateViewPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen items-center justify-center bg-zinc-50 text-zinc-500 gap-3">
        <Loader2 className="animate-spin text-sky-600" size={32} />
        <span className="font-semibold text-zinc-600 text-sm tracking-wide">Loading Client Portal...</span>
      </div>
    }>
      <EstimateDetail />
    </Suspense>
  );
}
