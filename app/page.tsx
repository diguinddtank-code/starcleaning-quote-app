'use client';

import Link from 'next/link';
import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { FileText, PlusCircle, History, Settings, ArrowRight, Printer, X } from 'lucide-react';
import { useState } from 'react';
import { SavedQuote } from '@/lib/types';
import { QuoteDocument } from '@/components/QuoteDocument';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardPage() {
  const { savedQuotes } = useQuote();
  const { settings } = useSettings();
  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);
  
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
              <History className="text-sky-500" size={20} /> Recent Leads
            </h2>
            <Link href="/leads" className="text-sm font-medium text-sky-600 hover:text-sky-700">
              View All
            </Link>
          </div>
          
          {recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <div 
                  key={quote.id} 
                  onClick={() => setSelectedQuote(quote)}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50 hover:bg-sky-50 hover:border-sky-100 cursor-pointer transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-sky-900">{quote.customerName || 'Valued Customer'}</p>
                    <p className="text-xs text-zinc-500">{new Date(quote.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-sky-900">${quote.total}</p>
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

      {/* Quote PDF Modal */}
      <AnimatePresence>
        {selectedQuote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 overflow-y-auto print:bg-white print:p-0"
          >
            <div className="flex min-h-full items-start justify-center p-4 sm:p-6 md:py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-zinc-200 overflow-hidden print:border-none print:shadow-none print:m-0 relative"
              >
                <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex justify-between items-center print:hidden">
                  <h3 className="font-bold text-zinc-900">Estimate Details</h3>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                      <Printer size={16} /> Print / PDF
                    </button>
                    <button 
                      onClick={() => setSelectedQuote(null)} 
                      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-0 sm:p-8 print:p-0">
                  <QuoteDocument quote={selectedQuote} settings={settings} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
