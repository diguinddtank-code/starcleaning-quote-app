'use client';

import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { Trash2, User, Phone, Calendar, DollarSign, FileText, Printer, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { SavedQuote } from '@/lib/types';
import { QuoteDocument } from '@/components/QuoteDocument';
import { motion, AnimatePresence } from 'motion/react';

export default function HistoryPage() {
  const { savedQuotes, deleteQuote } = useQuote();
  const { settings } = useSettings();
  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <header className="mb-8 border-b border-zinc-200 pb-6 print:hidden">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Estimate History</h1>
        <p className="text-sm text-zinc-500 mt-1">View and manage synchronized quotes across the team.</p>
      </header>

      {savedQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm print:hidden">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-2">No estimates found</h2>
          <p className="text-sm text-zinc-500">Estimates saved from the calculator will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 print:hidden">
          {savedQuotes.map((quote, index) => (
            <div 
              key={quote.id || `quote-${index}`} 
              onClick={() => setSelectedQuote(quote)}
              className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-sky-500/30 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md text-xs font-semibold uppercase tracking-wider">
                    {quote.serviceType === 'residential' ? 'Residential' :
                     quote.serviceType === 'deep' ? 'Deep Clean' :
                     quote.serviceType === 'move' ? 'Move In/Out' :
                     quote.serviceType === 'vacation' ? 'Vacation/Airbnb' :
                     quote.serviceType === 'commercial' ? 'Commercial' :
                     'Post-Construction'}
                  </span>
                  <span className="text-zinc-400 text-xs font-medium flex items-center gap-1">
                    <Calendar size={14} /> {new Date(quote.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-zinc-600">
                  <div><span className="text-zinc-400 text-xs block mb-0.5">Area</span><span className="font-medium text-zinc-900">{quote.sqFt} sq ft</span></div>
                  <div><span className="text-zinc-400 text-xs block mb-0.5">Bedrooms</span><span className="font-medium text-zinc-900">{quote.beds}</span></div>
                  <div><span className="text-zinc-400 text-xs block mb-0.5">Bathrooms</span><span className="font-medium text-zinc-900">{quote.baths}</span></div>
                  <div><span className="text-zinc-400 text-xs block mb-0.5">Half Baths</span><span className="font-medium text-zinc-900">{quote.halfBaths}</span></div>
                </div>

                {(quote.customerName || quote.customerPhone) && (
                  <div className="flex items-center gap-4 pt-3 border-t border-zinc-100 text-sm text-zinc-600">
                    {quote.customerName && <span className="flex items-center gap-1.5"><User size={14} className="text-zinc-400" /> <span className="font-medium text-zinc-900">{quote.customerName}</span></span>}
                    {quote.customerPhone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-zinc-400" /> <span className="font-medium text-zinc-900">{quote.customerPhone}</span></span>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6">
                <div className="text-2xl font-bold text-zinc-900 flex items-center tracking-tight">
                  <DollarSign size={20} className="text-zinc-400" />
                  {quote.total}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuote(quote);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                  >
                    <FileText size={14} /> View PDF
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteQuote(quote.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Delete Quote"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Modal */}
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
                <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                  <div className="flex items-center gap-2 text-zinc-700 font-medium">
                    <FileText size={20} /> Estimate Document
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <button onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                      <Printer size={16} /> Print / PDF
                    </button>
                    <button onClick={() => setSelectedQuote(null)} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      Close
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
