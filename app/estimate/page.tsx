'use client';

import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { Stepper } from '@/components/ui/Stepper';
import { ServiceCard, ExtraCard } from '@/components/ui/Cards';
import { ServiceType } from '@/lib/types';
import { Home, Sparkles, Key, Wind, Droplets, Box, WashingMachine, CarFront, FileText, CheckCircle2, Building2, Hammer, Printer, Loader2, BookOpen, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { SavedQuote } from '@/lib/types';
import { QuoteDocument } from '@/components/QuoteDocument';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CalculatorPage() {
  const { quote, updateQuote, totalPrice, saveQuote, resetQuote } = useQuote();
  const { settings } = useSettings();
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [savedEstimate, setSavedEstimate] = useState<SavedQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleServiceChange = (type: ServiceType) => {
    updateQuote({ serviceType: type });
  };

  const toggleExtra = (extraId: string) => {
    const isSelected = quote.selectedExtras.includes(extraId);
    if (isSelected) {
      updateQuote({ selectedExtras: quote.selectedExtras.filter(id => id !== extraId) });
    } else {
      updateQuote({ selectedExtras: [...quote.selectedExtras, extraId] });
    }
  };

  const handleSave = async () => {
    setIsGenerating(true);
    setSaveError(null);
    
    // Simulate a slight delay for visual feedback of "processing"
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const newQuote = await saveQuote(customerName, customerPhone);
      setSavedEstimate(newQuote);
      
      setIsGenerating(false);
      setShowSuccessToast(true);
      
      // Show the summary modal after the toast
      setTimeout(() => {
        setShowSuccessToast(false);
        setShowSummary(true);
      }, 2500);
    } catch (error: any) {
      console.error("Failed to save quote:", error);
      setIsGenerating(false);
      setSaveError(error.message || "Failed to sync with database. Check Supabase RLS policies.");
      
      // We still show the summary so they don't lose their work, but they know it didn't sync
      setTimeout(() => {
        setSaveError(null);
        setShowSummary(true);
      }, 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <header className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">New Estimate</h1>
        <p className="text-sm text-zinc-500 mt-1">Configure property details to generate a synchronized quote.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Property Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Home className="text-sky-500" size={20} /> Property Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <Stepper 
                  label="Square Footage" 
                  value={quote.sqFt} 
                  onChange={(val) => updateQuote({ sqFt: val })} 
                  min={500} max={10000} step={100} 
                />
              </div>
              <Stepper 
                label="Bedrooms" 
                value={quote.beds} 
                onChange={(val) => updateQuote({ beds: val })} 
                min={0} max={10} 
              />
              <Stepper 
                label="Bathrooms" 
                value={quote.baths} 
                onChange={(val) => updateQuote({ baths: val })} 
                min={0} max={10} 
              />
              <div className="col-span-1 md:col-span-2">
                <Stepper 
                  label="Half Baths" 
                  value={quote.halfBaths} 
                  onChange={(val) => updateQuote({ halfBaths: val })} 
                  min={0} max={5} 
                />
              </div>
            </div>
          </section>

          {/* Service Type */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Sparkles className="text-sky-500" size={20} /> Service Tier
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <ServiceCard 
                title="Residential" 
                description="Regular maintenance cleaning." 
                icon={<Home size={20} />} 
                selected={quote.serviceType === 'residential'} 
                onClick={() => handleServiceChange('residential')} 
              />
              <ServiceCard 
                title="Deep Clean" 
                description="Thorough top-to-bottom clean." 
                icon={<Sparkles size={20} />} 
                selected={quote.serviceType === 'deep'} 
                onClick={() => handleServiceChange('deep')} 
              />
              <ServiceCard 
                title="Move In/Out" 
                description="Empty home deep cleaning." 
                icon={<Key size={20} />} 
                selected={quote.serviceType === 'move'} 
                onClick={() => handleServiceChange('move')} 
              />
              <ServiceCard 
                title="Vacation/Airbnb" 
                description="Turnover cleaning for rentals." 
                icon={<Home size={20} />} 
                selected={quote.serviceType === 'vacation'} 
                onClick={() => handleServiceChange('vacation')} 
              />
              <ServiceCard 
                title="Commercial" 
                description="Office & business cleaning." 
                icon={<Building2 size={20} />} 
                selected={quote.serviceType === 'commercial'} 
                onClick={() => handleServiceChange('commercial')} 
              />
              <ServiceCard 
                title="Post-Construction" 
                description="Heavy duty dust & debris removal." 
                icon={<Hammer size={20} />} 
                selected={quote.serviceType === 'construction'} 
                onClick={() => handleServiceChange('construction')} 
              />
            </div>
          </section>

          {/* Extras */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Box className="text-sky-500" size={20} /> Add-on Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ExtraCard title="Inside Oven" price={settings.extras.oven} icon={<Box size={18} />} selected={quote.selectedExtras.includes('oven')} onClick={() => toggleExtra('oven')} />
              <ExtraCard title="Inside Fridge" price={settings.extras.fridge} icon={<Box size={18} />} selected={quote.selectedExtras.includes('fridge')} onClick={() => toggleExtra('fridge')} />
              <ExtraCard title="Interior Windows" price={settings.extras.windows} icon={<Wind size={18} />} selected={quote.selectedExtras.includes('windows')} onClick={() => toggleExtra('windows')} />
              <ExtraCard title="Laundry (per load)" price={settings.extras.laundry} icon={<WashingMachine size={18} />} selected={quote.selectedExtras.includes('laundry')} onClick={() => toggleExtra('laundry')} />
              <ExtraCard title="Inside Cabinets" price={settings.extras.cabinets} icon={<Box size={18} />} selected={quote.selectedExtras.includes('cabinets')} onClick={() => toggleExtra('cabinets')} />
              <ExtraCard title="Garage Sweep" price={settings.extras.garage} icon={<CarFront size={18} />} selected={quote.selectedExtras.includes('garage')} onClick={() => toggleExtra('garage')} />
            </div>
          </section>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
              <FileText className="text-sky-500" size={20} />
              <h3 className="text-lg font-bold text-zinc-900">Estimate Summary</h3>
            </div>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Base Rate</span>
                <span className="font-medium text-zinc-900">${settings.basePrice}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Area ({quote.sqFt} sq ft)</span>
                <span className="font-medium text-zinc-900">${Math.round(quote.sqFt * settings.pricePerSqFt)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Rooms ({quote.beds}B, {quote.baths}BA)</span>
                <span className="font-medium text-zinc-900">${(quote.beds * settings.bedPrice) + (quote.baths * settings.bathPrice) + (quote.halfBaths * settings.halfBathPrice)}</span>
              </div>
              
              {quote.serviceType !== 'residential' && (
                <div className="flex justify-between text-sky-600 font-medium bg-sky-50/50 p-2 rounded-lg -mx-2">
                  <span>
                    {quote.serviceType === 'deep' ? 'Deep Clean' : 
                     quote.serviceType === 'move' ? 'Move In/Out' : 
                     quote.serviceType === 'vacation' ? 'Vacation/Airbnb' : 
                     quote.serviceType === 'commercial' ? 'Commercial' : 
                     'Post-Construction'} Multiplier
                  </span>
                  <span>
                    x{quote.serviceType === 'deep' ? settings.deepCleanMultiplier : 
                      quote.serviceType === 'move' ? settings.moveInOutMultiplier : 
                      quote.serviceType === 'vacation' ? settings.vacationMultiplier : 
                      quote.serviceType === 'commercial' ? settings.commercialMultiplier : 
                      settings.constructionMultiplier}
                  </span>
                </div>
              )}

              {quote.selectedExtras.length > 0 && (
                <div className="pt-3 mt-3 border-t border-zinc-100">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Add-ons</p>
                  {quote.selectedExtras.map(extra => (
                    <div key={extra} className="flex justify-between text-zinc-600 mb-1.5">
                      <span className="capitalize">{extra}</span>
                      <span className="font-medium text-zinc-900">${settings.extras[extra as keyof typeof settings.extras]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-zinc-500 font-medium text-sm">Total Estimate</span>
                <span className="text-3xl font-bold text-zinc-900 tracking-tight">${totalPrice}</span>
              </div>
            </div>

            <div className="mb-6 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-600" />
                Negotiation Margin
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-amber-900 font-medium">Discount (10%)</span>
                  <span className="text-amber-700 font-bold bg-amber-100/50 px-2 py-0.5 rounded">${Math.round(totalPrice * 0.9)}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-red-900 font-medium">Bottom Limit (15%)</span>
                  <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">${Math.round(totalPrice * 0.85)}</span>
                </div>
              </div>
              <Link href="/playbook" target="_blank" className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors">
                <BookOpen size={14} /> Open Sales Playbook
              </Link>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client Details</label>
                <input 
                  type="text" 
                  placeholder="Client Name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={isGenerating || showSuccessToast}
                className="w-full py-3 mt-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Estimate...
                  </>
                ) : showSuccessToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Estimate Generated!
                  </>
                ) : (
                  'Save & Synchronize Quote'
                )}
              </button>
              <button 
                onClick={resetQuote}
                disabled={isGenerating}
                className="w-full py-2.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast Overlay */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="bg-green-500/20 p-2 rounded-full">
              <CheckCircle2 className="text-green-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">ESTIMATE GENERATED!</h4>
              <p className="text-xs text-zinc-400">Synchronized with leads.</p>
            </div>
            <button 
              onClick={() => router.push('/leads')}
              className="ml-4 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-lg transition-colors"
            >
              View in Leads
            </button>
          </motion.div>
        )}

        {saveError && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-red-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="bg-red-500/20 p-2 rounded-full">
              <Hammer className="text-red-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Sync Error</h4>
              <p className="text-xs text-red-200 max-w-xs">{saveError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <AnimatePresence>
      {showSummary && savedEstimate && (
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
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 size={20} /> Estimate Saved Successfully
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <button onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                    <Printer size={16} /> Print / PDF
                  </button>
                  <button 
                    onClick={() => {
                      setShowSummary(false);
                      resetQuote();
                      router.push('/leads');
                    }} 
                    className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-700 text-sm font-bold rounded-lg transition-colors shadow-sm"
                  >
                    View in Leads
                  </button>
                  <button 
                    onClick={() => {
                      setShowSummary(false);
                      resetQuote();
                    }} 
                    className="flex-1 sm:flex-none justify-center px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                  >
                    DONE
                  </button>
                </div>
              </div>
              <div className="p-0 sm:p-8 print:p-0">
                <QuoteDocument quote={savedEstimate} settings={settings} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
