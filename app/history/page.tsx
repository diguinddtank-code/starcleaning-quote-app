'use client';

import { useQuote } from '@/context/QuoteContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Search, Calendar, User, DollarSign, 
  Trash2, FileText, Printer, ArrowRight,
  Filter, X, MapPin, ChevronRight
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function QuoteHistoryPage() {
  const { savedQuotes, deleteQuote } = useQuote();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Filter quotes based on search and type
  const filteredQuotes = useMemo(() => {
    return savedQuotes.filter(quote => {
      const matchesSearch = 
        quote.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customerAddress?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || quote.serviceType === typeFilter;
      
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [savedQuotes, searchQuery, typeFilter]);

  // Unique service types for filtering
  const serviceTypes = useMemo(() => {
    const types = new Set(savedQuotes.map(q => q.serviceType).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [savedQuotes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('history.title')}</h1>
          <p className="text-zinc-500 mt-1">{t('history.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/estimate" 
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-zinc-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <FileText size={18} /> {t('nav.estimate')}
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder={t('history.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {serviceTypes.map(type => (
              <button
                key={type || 'unknown'}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                  typeFilter === type 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {type === 'All' ? (language === 'en' ? 'All Services' : 'Todos os Serviços') : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Quotes */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredQuotes.map((quote) => (
            <motion.div
              layout
              key={quote.id}
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Highlight bar based on frequency */}
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                quote.frequency?.toLowerCase().includes('weekly') ? "bg-emerald-500" :
                quote.frequency?.toLowerCase().includes('bi-weekly') ? "bg-sky-500" :
                "bg-zinc-300"
              )} />
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 truncate max-w-[150px]">{quote.customerName}</h3>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {new Date(quote.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-zinc-900">${quote.total}</span>
                    {quote.frequency && (
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                        {quote.frequency}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-sky-500"><FileText size={14} /></div>
                    <span className="text-xs font-semibold text-zinc-600 line-clamp-1">{quote.serviceType}</span>
                  </div>
                  {quote.customerAddress && (
                    <div className="flex items-start gap-2">
                       <div className="mt-0.5 text-zinc-400"><MapPin size={14} /></div>
                       <span className="text-xs text-zinc-500 line-clamp-1">{quote.customerAddress}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const confirmDelete = window.confirm(language === 'en' ? 'Delete this quote?' : 'Excluir este orçamento?');
                        if (confirmDelete) deleteQuote(quote.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    {quote.leadId && (
                      <Link 
                        href={`/leads/${quote.leadId}`}
                        className="p-2 text-zinc-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                        title="View Lead"
                      >
                        <User size={16} />
                      </Link>
                    )}
                  </div>
                  
                  <Link 
                    href={quote.leadId ? `/leads/${quote.leadId}` : "/history"}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs font-bold transition-all"
                  >
                    {language === 'en' ? 'Details' : 'Detalhes'}
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredQuotes.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200">
              <FileText size={32} />
            </div>
            <div>
              <p className="text-zinc-500 font-bold">{t('history.empty')}</p>
              <button 
                onClick={() => { setSearchQuery(''); setTypeFilter('All'); }}
                className="mt-2 text-sm text-sky-600 hover:underline font-bold"
              >
                {language === 'en' ? 'Clear all filters' : 'Limpar filtros'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
