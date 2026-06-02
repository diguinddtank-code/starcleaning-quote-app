/* eslint-disable react/no-unescaped-entities */
'use client';

import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { Stepper } from '@/components/ui/Stepper';
import { ServiceCard, ExtraCard } from '@/components/ui/Cards';
import { ServiceType } from '@/lib/types';
import { Home, Sparkles, Key, Wind, Droplets, Box, WashingMachine, CarFront, FileText, CheckCircle2, Building2, Hammer, Printer, Loader2, BookOpen, ShieldAlert, Copy, MessageCircle, X, Calendar, Send, ChevronDown } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { SavedQuote } from '@/lib/types';
import { QuoteDocument } from '@/components/QuoteDocument';
import { generateQuoteEmailHtml } from '@/lib/emailTemplate';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLead } from '@/context/LeadContext';
import { useLanguage } from '@/context/LanguageContext';

function CalculatorContent() {
  const { quote, updateQuote, totalPrice, saveQuoteToLead, resetQuote } = useQuote();
  const { settings } = useSettings();
  const { leads } = useLead();
  const { language, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leadId, setLeadId] = useState<string | undefined>(searchParams?.get('leadId') || undefined);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showLeadSuggestions, setShowLeadSuggestions] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [savedEstimate, setSavedEstimate] = useState<SavedQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showScripts, setShowScripts] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookSentStatus, setWebhookSentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSendEstimateWebhook = async () => {
    setIsSendingWebhook(true);
    setWebhookSentStatus('idle');
    try {
      // Always save to ensure we capture the most up to date configuration (e.g. manual discounts)
      const currentLeadId = savedEstimate?.leadId || leadId;
      const finalQuote = await saveQuoteToLead(currentLeadId, customerName, customerPhone, customerEmail);
      
      setSavedEstimate(finalQuote);
      if (finalQuote.leadId && !leadId) {
        setLeadId(finalQuote.leadId);
      }

      const WEBHOOK_URL = 'https://webhook.infra-remakingautomacoes.cloud/webhook/estimatesc';
      const estimateUrl = `${window.location.origin}/estimate/view?id=${finalQuote.id}`;
      
      const htmlContent = generateQuoteEmailHtml(finalQuote, settings, estimateUrl);
      
      const payload = {
        event: 'estimate_sent',
        leadId: finalQuote.leadId || null,
        customerName,
        customerEmail,
        customerPhone,
        total: totalPrice,
        frequency: quote.frequency,
        serviceType: quote.serviceType,
        sqFt: quote.sqFt,
        beds: quote.beds,
        baths: quote.baths,
        extras: quote.selectedExtras || [],
        militaryDiscount: quote.militaryDiscount || false,
        manualDiscount: quote.manualDiscount || 0,
        estimateUrl: estimateUrl,
        htmlContent: htmlContent
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server returned ' + response.status);
      }

      setWebhookSentStatus('success');
      setTimeout(() => setWebhookSentStatus('idle'), 4000);
    } catch (error) {
      console.error('Failed to send estimate to webhook:', error);
      setWebhookSentStatus('error');
      setTimeout(() => setWebhookSentStatus('idle'), 4000);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setCustomerName(lead.Nome || '');
        setCustomerPhone(lead.Telefone || '');
        setCustomerEmail(lead.Email || '');
        const updates: Record<string, number> = {};
        if (lead.Quartos) updates.beds = parseInt(lead.Quartos) || quote.beds;
        if (lead.Banheiros) updates.baths = parseInt(lead.Banheiros) || quote.baths;
        if (Object.keys(updates).length > 0) updateQuote(updates);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, leads]);

  const { weeklyPrice, biWeeklyPrice, monthlyPrice } = (() => {
    let tier = settings.pricingTiers?.find(t => quote.sqFt >= t.minSqft && quote.sqFt <= t.maxSqft);
    if (!tier && settings.pricingTiers && settings.pricingTiers.length > 0) {
      tier = settings.pricingTiers.reduce((prev, curr) => 
        Math.abs(curr.maxSqft - quote.sqFt) < Math.abs(prev.maxSqft - quote.sqFt) ? curr : prev
      );
    }

    if (tier) {
      return {
        weeklyPrice: tier.recurring.weekly.max,
        biWeeklyPrice: tier.recurring.biWeekly.max,
        monthlyPrice: tier.recurring.monthly.max
      };
    }

    // fallback
    let base = settings.basePrice;
    base += quote.sqFt * settings.pricePerSqFt;
    base += quote.beds * settings.bedPrice;
    base += quote.baths * settings.bathPrice;
    base += quote.halfBaths * settings.halfBathPrice;
    return {
      weeklyPrice: Math.round(base * settings.weeklyMultiplier),
      biWeeklyPrice: Math.round(base * settings.biWeeklyMultiplier),
      monthlyPrice: Math.round(base * settings.monthlyMultiplier)
    };
  })();

  // Calculate estimated duration (man-hours) internally
  const calculateDuration = () => {
    let hours = 1.0; // Base time
    // 30 mins per 500 sq ft roughly
    hours += (quote.sqFt / 500) * 0.5;
    // Rooms
    hours += quote.beds * 0.25;
    hours += quote.baths * 0.5;
    hours += quote.halfBaths * 0.25;
    if ((quote.selectedExtras || []).includes('sheetChange')) {
      const additionalBeds = Math.max(0, quote.beds - 1);
      hours += additionalBeds * 0.25; // 15 mins per extra bed
    }

    let multiplier = 1;
    if (quote.serviceType === 'deep') multiplier = 1.5;
    if (quote.serviceType === 'move') multiplier = 2;
    if (quote.serviceType === 'vacation') multiplier = 1.2;
    if (quote.serviceType === 'commercial') multiplier = 1.5;
    if (quote.serviceType === 'construction') multiplier = 2.5;

    hours *= multiplier;

    (quote.selectedExtras || []).forEach((extra) => {
      if (extra === 'oven') hours += 0.5;
      if (extra === 'fridge') hours += 0.5;
      if (extra === 'windows') hours += 1.0;
      if (extra === 'laundry') hours += 0.5;
      if (extra === 'cabinets') hours += 0.75;
      if (extra === 'garage') hours += 1.0;
    });

    // Round to nearest 0.5
    return Math.max(1.5, Math.round(hours * 2) / 2);
  };

  const estimatedHours = calculateDuration();

  const serviceDescriptions: Partial<Record<ServiceType, string[]>> = {
    residential: ["General dusting & wipe down of surfaces", "Vacuum & mop all accessible floors", "Kitchen counters & exterior of appliances", "Full bathroom sanitization", "Empty small trash bins"],
    deep: ["Everything in Residential, PLUS:", "Baseboards & window sills wiped", "Ceiling fans & light fixtures dusted", "Extra scrubbing in high-traffic bathrooms", "Heavy dusting & cobweb removal"],
    move: ["Everything in Deep Clean, PLUS:", "Inside all empty cabinets and drawers", "Inside all empty closets", "Inside & behind appliances (if moved)"],
    vacation: ["Check for damages & left items", "Launder all linens & remake beds", "Restock supplies (toilet paper, soap)", "Detailed clean & sanitization for next guest"],
    commercial: ["Reception & common areas", "Desk & cubicle wipe down", "Restroom maintenance", "Breakroom cleaning", "Trash removal & flooring"],
    construction: ["Heavy dust removal from all surfaces", "Paint drop & sticker removal", "Vacuum inside cabinets & drawers", "Detailed trim & baseboard wipe down"]
  };

  const handleServiceChange = (type: ServiceType) => {
    if (type !== 'residential') {
      updateQuote({ serviceType: type, frequency: 'one-time' });
    } else {
      updateQuote({ serviceType: type, frequency: quote.frequency === 'one-time' ? 'weekly' : quote.frequency });
    }
  };

  const toggleExtra = (extraId: string) => {
    const isSelected = (quote.selectedExtras || []).includes(extraId);
    if (isSelected) {
      updateQuote({ selectedExtras: (quote.selectedExtras || []).filter(id => id !== extraId) });
    } else {
      updateQuote({ selectedExtras: [...(quote.selectedExtras || []), extraId] });
    }
  };

  const handleSave = async () => {
    setIsGenerating(true);
    setSaveError(null);
    
    // Simulate a slight delay for visual feedback of "processing"
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const newQuote = await saveQuoteToLead(leadId, customerName, customerPhone, customerEmail);
      setSavedEstimate(newQuote);
      if (newQuote.leadId && !leadId) {
        setLeadId(newQuote.leadId);
      }
      
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
      setSaveError(error.message || "Failed to sync with database.");
      
      // We still show the summary so they don't lose their work, but they know it didn't sync
      setTimeout(() => {
        setSaveError(null);
        setShowSummary(true);
      }, 4000);
    }
  };

  const serviceOptions = [
    { id: 'residential', title: 'Residential', description: 'Regular maintenance cleaning.', icon: Home },
    { id: 'deep', title: 'Deep Clean', description: 'Thorough top-to-bottom clean.', icon: Sparkles },
    { id: 'move', title: 'Move In/Out', description: 'Empty home deep cleaning.', icon: Key },
    { id: 'vacation', title: 'Vacation/Airbnb', description: 'Turnover cleaning for rentals.', icon: Building2 },
  ];

  const selectedServiceOption = serviceOptions.find(o => o.id === quote.serviceType) || null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-32 md:pb-8 space-y-8">
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
              <Stepper 
                label="Half Baths" 
                value={quote.halfBaths} 
                onChange={(val) => updateQuote({ halfBaths: val })} 
                min={0} max={5} 
              />
            </div>
          </section>

          {/* Service Tier */}
          <section className="space-y-4 relative z-20">
            <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Sparkles className="text-sky-500" size={20} /> Service Tier
            </h2>
            
            <div className="relative max-w-sm">
              <button
                type="button"
                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-300 outline-none focus:ring-4 focus:ring-sky-500/20 ${
                  isServiceDropdownOpen 
                    ? 'border-sky-500 bg-sky-50/50 shadow-sm' 
                    : quote.serviceType 
                      ? 'border-sky-500 bg-sky-50/50 shadow-sm' 
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-colors ${
                    quote.serviceType ? 'bg-sky-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {selectedServiceOption ? <selectedServiceOption.icon size={20} /> : <Box size={20} />}
                  </div>
                  <div className="text-left">
                    <div className={`font-bold text-sm ${quote.serviceType ? 'text-sky-950' : 'text-zinc-700'}`}>
                      {selectedServiceOption ? selectedServiceOption.title : 'Select a Service Tier'}
                    </div>
                    <div className={`text-[11px] font-medium leading-tight ${quote.serviceType ? 'text-sky-700/80' : 'text-zinc-500'}`}>
                      {selectedServiceOption ? selectedServiceOption.description : 'Choose the best match for your needs'}
                    </div>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-zinc-400 transition-transform duration-300 ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isServiceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden z-30"
                  >
                    <div className="p-2 space-y-1">
                      {serviceOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            handleServiceChange(opt.id as ServiceType);
                            setIsServiceDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group ${
                            quote.serviceType === opt.id ? 'bg-sky-50/80' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            quote.serviceType === opt.id ? 'bg-sky-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700'
                          }`}>
                            <opt.icon size={18} />
                          </div>
                          <div className="text-left flex-1">
                            <div className={`text-[13px] font-bold ${quote.serviceType === opt.id ? 'text-sky-950' : 'text-zinc-700 group-hover:text-zinc-900'}`}>
                              {opt.title}
                            </div>
                            <div className="text-[11px] font-medium text-zinc-500">
                              {opt.description}
                            </div>
                          </div>
                          {quote.serviceType === opt.id && (
                            <CheckCircle2 size={18} className="text-sky-500 mr-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </section>

          {/* Service Frequency, Extras, and Description wrapper */}
          <AnimatePresence mode="wait">
            {quote.serviceType && (
              <motion.div 
                key="details-sections"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-12"
              >
                {/* Service Frequency */}
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                    <Calendar className="text-sky-500" size={20} /> Service Frequency
                  </h2>
                  
                  {quote.serviceType === 'residential' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      {[
                        { id: 'weekly', label: 'Weekly', desc: 'Most popular view' },
                        { id: 'bi-weekly', label: 'Bi-weekly', desc: 'Every 14 days' },
                        { id: 'monthly', label: 'Monthly', desc: 'Every 4 weeks' }
                      ].map((freq) => (
                        <button
                          key={freq.id}
                          onClick={() => updateQuote({ frequency: freq.id as any })}
                          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 outline-none focus:ring-4 focus:ring-sky-500/20 ${
                            quote.frequency === freq.id
                              ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                              : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            quote.frequency === freq.id ? 'bg-sky-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            <Calendar size={18} />
                          </div>
                          <div className="text-left">
                            <div className={`font-bold text-sm ${quote.frequency === freq.id ? 'text-sky-900' : 'text-zinc-700'}`}>
                              {freq.label}
                            </div>
                            <div className={`text-[11px] font-medium ${quote.frequency === freq.id ? 'text-sky-600' : 'text-zinc-500'}`}>
                              {freq.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 max-w-2xl">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-zinc-900 tracking-wide">
                            {language === 'en' ? 'Frequency: One-time Clean' : 'Frequência: Visita Única'}
                          </h4>
                          <p className="text-xs text-zinc-500 font-medium mt-0.5">
                            {language === 'en' 
                              ? 'Specialized cleans are scheduled as single visits for a thorough outcome.' 
                              : 'Limpezas avulsas para garantir resultados excepcionais.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center shrink-0">
                        <span className="bg-emerald-500/10 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-500/15">
                          {language === 'en' ? 'Selected' : 'Selecionado'}
                        </span>
                      </div>
                    </div>
                  )}
                </section>

                {/* Extras */}
                <section className="space-y-4 border-t border-zinc-100 pt-8">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                    <Box className="text-sky-500" size={20} /> Add-on Services
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ExtraCard title="Inside Oven" price={settings.extras.oven} selected={(quote.selectedExtras || []).includes('oven')} onClick={() => toggleExtra('oven')} />
                    <ExtraCard title="Inside Fridge" price={settings.extras.fridge} selected={(quote.selectedExtras || []).includes('fridge')} onClick={() => toggleExtra('fridge')} />
                    <ExtraCard title="Interior Windows" price={settings.extras.windows} selected={(quote.selectedExtras || []).includes('windows')} onClick={() => toggleExtra('windows')} />
                    <ExtraCard title="Inside Cabinets" price={settings.extras.cabinets} selected={(quote.selectedExtras || []).includes('cabinets')} onClick={() => toggleExtra('cabinets')} />
                    {quote.serviceType === 'deep' && (
                      <ExtraCard title="Sheet change (after 1st one)" price={settings.extras.sheetChange || 10} selected={(quote.selectedExtras || []).includes('sheetChange')} onClick={() => toggleExtra('sheetChange')} />
                    )}
                  </div>
                </section>

                {/* Discounts */}
                <section className="space-y-4 border-t border-zinc-100 pt-8">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                    <CheckCircle2 className="text-sky-500" size={20} /> Discounts & Adjustments
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ExtraCard 
                      title="Military Discount" 
                      priceText="-10%" 
                      selected={!!quote.militaryDiscount} 
                      onClick={() => updateQuote({ militaryDiscount: !quote.militaryDiscount })} 
                    />
                    <div className="flex flex-col justify-center gap-1.5 p-3 rounded-xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
                      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Manual Discount ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                        <input 
                          type="number"
                          min="0"
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-1.5 border border-zinc-200 rounded-lg text-sm font-medium outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                          value={quote.manualDiscount || ''}
                          onChange={(e) => updateQuote({ manualDiscount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Dynamic Service Description */}
                <section className="space-y-4 border-t border-zinc-100 pt-8">
                  <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 text-sm animate-in fade-in duration-300">
                    <h3 className="font-bold text-sky-900 mb-3 flex items-center gap-2 text-base">
                      <BookOpen size={18} className="text-sky-500" /> 
                      What&apos;s included in {quote.serviceType === 'move' ? 'Move In/Out' : quote.serviceType.charAt(0).toUpperCase() + quote.serviceType.slice(1)}?
                    </h3>
                    <ul className="space-y-2.5 text-sky-800">
                      {serviceDescriptions[quote.serviceType]?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 size={18} className="text-sky-500 mt-0.5 shrink-0" />
                          <span className={i === 0 && (quote.serviceType === 'deep' || quote.serviceType === 'move') ? 'font-bold' : 'leading-relaxed'}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
              <FileText className="text-sky-500" size={20} />
              <h3 className="text-lg font-bold text-zinc-900">Estimate Summary</h3>
            </div>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 mb-4">
                <p className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">Service Details</p>
                <div className="grid grid-cols-2 gap-2 text-sky-900 font-medium">
                  <div><span className="text-sky-600/70 block text-[10px] uppercase">Service Type</span> <span className="capitalize">{quote.serviceType ? `${quote.serviceType === 'move' ? 'Move In/Out' : quote.serviceType} Cleaning` : 'Not Selected'}</span></div>
                  <div><span className="text-sky-600/70 block text-[10px] uppercase">Area</span> {quote.sqFt} sq ft</div>
                  <div><span className="text-sky-600/70 block text-[10px] uppercase">Rooms</span> {quote.beds} Beds, {quote.baths} Baths</div>
                  <div><span className="text-sky-600/70 block text-[10px] uppercase">Frequency</span> <span className="capitalize">{quote.frequency}</span></div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">What's Included</p>
                <ul className="text-zinc-600 space-y-1.5 text-xs">
                  <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> Dusting of all surfaces, furniture, and baseboards</li>
                  <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> Vacuuming and mopping all floors</li>
                  <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> Full sanitization of bathrooms (toilets, showers, sinks)</li>
                  <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> Kitchen cleaning (counters, sink, exterior of appliances)</li>
                  {quote.serviceType === 'deep' && (
                    <li className="flex items-start gap-1.5 font-bold text-sky-700 bg-sky-50 rounded px-1 -mx-1"><Sparkles size={14} className="text-sky-500 shrink-0 mt-0.5" /> Heavy-duty scrubbing, doors, door frames, and interior windows</li>
                  )}
                  {quote.serviceType === 'move' && (
                    <li className="flex items-start gap-1.5 font-bold text-sky-700 bg-sky-50 rounded px-1 -mx-1"><Sparkles size={14} className="text-sky-500 shrink-0 mt-0.5" /> Inside cabinets/drawers, inside fridge/oven, and deep cleaning</li>
                  )}
                  {quote.serviceType === 'vacation' && (
                    <li className="flex items-start gap-1.5 font-bold text-sky-700 bg-sky-50 rounded px-1 -mx-1"><Sparkles size={14} className="text-sky-500 shrink-0 mt-0.5" /> Restocking supplies, laundry setup, and staging</li>
                  )}
                  {(quote.selectedExtras || []).includes('sheetChange') && quote.beds > 1 && (
                    <li className="flex items-start gap-1.5 font-medium"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> Changing Linens (Extra {quote.beds - 1} {quote.beds - 1 === 1 ? 'Bed' : 'Beds'})</li>
                  )}
                </ul>
              </div>

              {(quote.selectedExtras || []).length > 0 && (
                <div className="pt-3 border-t border-zinc-100">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Selected Add-ons</p>
                  {(quote.selectedExtras || []).map(extra => (
                    <div key={extra} className="flex items-center gap-1.5 text-zinc-600 mb-1.5 text-xs font-medium">
                      <CheckCircle2 size={14} className="text-sky-500" />
                      <span className="capitalize">{extra.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 mb-6">
              <div className="flex justify-between items-end mb-4">
                <span className="text-zinc-500 font-medium text-sm">Total Estimate</span>
                <span className="text-3xl font-bold text-zinc-900 tracking-tight">${totalPrice}</span>
              </div>

              {quote.frequency === 'one-time' && (
                <div className="space-y-2 mt-4 p-3 bg-sky-50 rounded-xl border border-sky-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 opacity-20">
                    <Sparkles size={40} className="text-sky-600" />
                  </div>
                  <p className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 relative z-10">Recurring Discounts</p>
                  <div className="flex items-center justify-between text-xs relative z-10">
                    <span className="text-sky-700 font-medium">Weekly</span>
                    <span className="font-bold text-sky-900">${weeklyPrice} <span className="text-[10px] font-normal text-sky-600">/visit</span></span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-sky-200/50 pt-2 relative z-10">
                    <span className="text-sky-700 font-medium">Bi-weekly</span>
                    <span className="font-bold text-sky-900">${biWeeklyPrice} <span className="text-[10px] font-normal text-sky-600">/visit</span></span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-sky-200/50 pt-2 relative z-10">
                    <span className="text-sky-700 font-medium">Every 4 Weeks</span>
                    <span className="font-bold text-sky-900">${monthlyPrice} <span className="text-[10px] font-normal text-sky-600">/visit</span></span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2 relative">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client Details</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Client Name (Type to search leads)" 
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setLeadId(undefined); // Reset since they are typing potentially a new name
                    }}
                    onFocus={() => setShowLeadSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLeadSuggestions(false), 200)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  {showLeadSuggestions && leads.length > 0 && customerName && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {leads.filter(l => l.Nome?.toLowerCase().includes(customerName.toLowerCase())).map(lead => (
                        <div 
                          key={lead.id}
                          className="px-3 py-2 text-sm hover:bg-sky-50 cursor-pointer border-b border-zinc-50 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setLeadId(lead.id);
                            setCustomerName(lead.Nome || '');
                            setCustomerPhone(lead.Telefone || '');
                            setCustomerEmail(lead.Email || '');
                            if (lead.Quartos) updateQuote({ beds: parseInt(lead.Quartos) || quote.beds });
                            if (lead.Banheiros) updateQuote({ baths: parseInt(lead.Banheiros) || quote.baths });
                            setShowLeadSuggestions(false);
                          }}
                        >
                          <div className="font-semibold text-zinc-800">{lead.Nome}</div>
                          <div className="text-[11px] text-zinc-500">{lead.Email || lead.Telefone || 'No contact info'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
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
                disabled={isGenerating || showSuccessToast || !customerName || !quote.serviceType}
                className="w-full py-3 mt-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'pt' ? 'Gerando Proposta...' : 'Generating Estimate...'}
                  </>
                ) : showSuccessToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {language === 'pt' ? 'Proposta Gerada!' : 'Estimate Generated!'}
                  </>
                ) : (
                  leadId 
                    ? (language === 'pt' ? 'Salvar Proposta no Lead' : 'Save Proposal to Lead')
                    : (language === 'pt' ? 'Criar Lead e Salvar Proposta' : 'Save Lead & Proposal')
                )}
              </button>

              <button 
                onClick={handleSendEstimateWebhook}
                disabled={isSendingWebhook || !customerName || !quote.serviceType}
                className="w-full py-3 mt-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingWebhook ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : webhookSentStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Estimate Enviado!
                  </>
                ) : webhookSentStatus === 'error' ? (
                  <>
                    <X className="w-4 h-4 text-rose-200" />
                    Erro ao Enviar
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Estimate
                  </>
                )}
              </button>

              <button 
                onClick={resetQuote}
                disabled={isGenerating}
                className="w-full py-2.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 mt-1"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Scripts Floating Button & Drawer */}
      <div className="fixed bottom-24 right-4 md:bottom-6 md:left-6 md:right-auto z-40">
        <button 
          onClick={() => setShowScripts(!showScripts)}
          className="bg-zinc-900 border border-zinc-700 text-white rounded-full p-4 md:px-5 md:py-3 shadow-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors font-medium text-sm"
        >
          <MessageCircle size={20} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden md:inline">{showScripts ? 'Close Scripts' : 'Quick Scripts'}</span>
        </button>

        <AnimatePresence>
          {showScripts && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 md:left-0 md:right-auto w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[65vh] md:max-h-[70vh]"
            >
              <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><BookOpen size={16}/> Sales Cheat Sheet</h3>
                <button onClick={() => setShowScripts(false)} className="text-zinc-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4 text-sm bg-zinc-50">
                <div className="space-y-1">
                  <p className="font-bold text-sky-700 text-xs uppercase tracking-wider">1. The Hook</p>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm relative">
                    <p className="italic text-zinc-700">"Hi {customerName || '[Name]'}, this is [Your Name] with Star Cleaning! I'm following up on the estimate you requested online. Did I catch you at a good time?"</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-sky-700 text-xs uppercase tracking-wider">2. Value & Price</p>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
                    <p className="italic text-zinc-700 mb-2">"Our goal is to take cleaning completely off your hands. We bring all supplies and our crews are fully insured. We estimate this {quote.frequency === 'one-time' ? 'one-time' : quote.frequency} clean will take about <strong>{estimatedHours} hours</strong>. {quote.frequency !== 'one-time' ? 'Your recurring rate' : 'Your total today'} is <strong>${totalPrice}</strong>."</p>
                    {quote.frequency === 'one-time' && (
                      <div className="border-t border-zinc-100 pt-2 mt-2">
                         <p className="text-xs font-bold text-sky-600 mb-1">RECURRING UPSELL:</p>
                         <p className="italic text-zinc-600 text-xs text-balance">"If you'd like us to maintain this, our bi-weekly rate drops down to <strong>${biWeeklyPrice}/visit</strong>, and weekly is <strong>${weeklyPrice}</strong>."</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-sky-700 text-xs uppercase tracking-wider">3. The Close</p>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
                    <p className="italic text-zinc-700">"Our schedule is filling up for next week, but we have an opening on <strong>[Day]</strong>. Would you like me to reserve that spot for you?"</p>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4 mt-2">
                  <p className="font-bold text-amber-700 text-xs uppercase tracking-wider mb-2">Price Objection</p>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 shadow-sm text-amber-900 italic">
                    "I completely understand. There are cheaper options out there. But with us, you're paying for verified, fully insured professionals, and the guarantee that if something isn't perfect, we fix it."
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Toast Overlay */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="bg-green-500/20 p-2 rounded-full hidden sm:block">
              <CheckCircle2 className="text-green-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">ESTIMATE GENERATED!</h4>
              <p className="text-xs text-zinc-400">Synchronized with leads.</p>
            </div>
            <button 
              onClick={() => {
                const targetLeadId = savedEstimate?.leadId || leadId;
                if (targetLeadId) {
                  router.push(`/leads/${targetLeadId}`);
                } else {
                  router.push('/leads');
                }
              }}
              className="ml-auto md:ml-4 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              {language === 'pt' ? 'Ver no Lead' : 'View in Lead'}
            </button>
          </motion.div>
        )}

        {saveError && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 bg-red-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="bg-red-500/20 p-2 rounded-full hidden sm:block">
              <Hammer className="text-red-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Sync Error</h4>
              <p className="text-xs text-red-200 max-w-[200px] md:max-w-xs">{saveError}</p>
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
                      const targetLeadId = savedEstimate?.leadId || leadId;
                      setShowSummary(false);
                      resetQuote();
                      if (targetLeadId) {
                        router.push(`/leads/${targetLeadId}`);
                      } else {
                        router.push('/leads');
                      }
                    }} 
                    className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-700 text-sm font-bold rounded-lg transition-colors shadow-sm"
                  >
                    {language === 'pt' ? 'Ver no Lead' : 'View in Lead'}
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

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-8 h-8" /></div>}>
      <CalculatorContent />
    </Suspense>
  );
}