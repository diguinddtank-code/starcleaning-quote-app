'use client';

import Link from 'next/link';
import { useQuote } from '@/context/QuoteContext';
import { FileText, PlusCircle, History, Settings, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { savedQuotes } = useQuote();
  
  const recentQuotes = savedQuotes.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <header className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Welcome to Star Cleaning SC Estimate System.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-2">
            <PlusCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Create New Estimate</h2>
          <p className="text-sm text-zinc-500 max-w-xs">
            Generate a new cleaning quote for a client, calculate prices, and save the estimate.
          </p>
          <Link 
            href="/estimate" 
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Start Estimate <ArrowRight size={18} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <History className="text-sky-500" size={20} /> Recent Estimates
            </h2>
            <Link href="/history" className="text-sm font-medium text-sky-600 hover:text-sky-700">
              View All
            </Link>
          </div>
          
          {recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{quote.customerName || 'Valued Customer'}</p>
                    <p className="text-xs text-zinc-500">{new Date(quote.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">${quote.total}</p>
                    <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider">{quote.serviceType}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 py-8">
              <FileText className="text-zinc-300" size={32} />
              <p className="text-sm text-zinc-500">No estimates created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
