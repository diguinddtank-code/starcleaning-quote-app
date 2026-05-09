'use client';

import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { FileText, Calendar, DollarSign, Edit3, Trash2, Home, MapPin, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { SavedQuote } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { QuoteDocument } from '@/components/QuoteDocument';

export default function HistoryPage() {
  const { savedQuotes, deleteQuote } = useQuote();
  const { settings } = useSettings();
  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this quote?')) {
      deleteQuote(id);
      if (selectedQuote?.id === id) {
        setSelectedQuote(null);
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-sky-100 text-sky-700';
      case 'contacted': return 'bg-amber-100 text-amber-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'lost': return 'bg-rose-100 text-rose-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      <header className="flex items-center gap-4 mb-6 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Estimates History</h1>
          <p className="text-sm text-zinc-500 mt-1">View and manage saved quotes.</p>
        </div>
      </header>

      {savedQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-sky-50 text-sky-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-2">No quotes found</h2>
          <p className="text-sm text-zinc-500 mb-6">You haven&apos;t generated any estimates yet.</p>
          <Link href="/estimate" className="inline-flex items-center gap-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">
            Create Estimate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedQuotes.map((quote) => (
            <div 
              key={quote.id}
              onClick={() => setSelectedQuote(quote)}
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md hover:border-sky-200 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-zinc-900 group-hover:text-sky-700 transition-colors">
                    {quote.customerName || 'Anonymous Client'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                    <Calendar size={12} />
                    {new Date(quote.date).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(quote.status)}`}>
                  {quote.status || 'new'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-zinc-50 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">Service</span>
                  <span className="text-sm font-medium text-zinc-700 capitalize">{quote.serviceType}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">Frequency</span>
                  <span className="text-sm font-medium text-zinc-700 capitalize">{quote.frequency}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">Size</span>
                  <span className="text-sm font-medium text-zinc-700">{quote.sqFt} sq ft</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">Property</span>
                  <span className="text-sm font-medium text-zinc-700">{quote.beds}B / {quote.baths + quote.halfBaths}Ba</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <div className="flex items-center gap-1.5 text-lg font-bold text-zinc-900">
                  <DollarSign size={18} className="text-zinc-400" />
                  {quote.total.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleDelete(quote.id, e)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Detail Modal */}
      <AnimatePresence>
        {selectedQuote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl relative"
            >
              <button 
                onClick={() => setSelectedQuote(null)}
                className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full z-10 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="p-2 py-4">
                <QuoteDocument quote={selectedQuote} settings={settings} />
              </div>
              
              <div className="p-6 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-3 sticky bottom-0">
                <button 
                  onClick={() => setSelectedQuote(null)}
                  className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
                >
                  Close
                </button>
                {selectedQuote.leadId && (
                  <Link 
                    href={`/leads/${selectedQuote.leadId}`}
                    className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    View Lead
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}