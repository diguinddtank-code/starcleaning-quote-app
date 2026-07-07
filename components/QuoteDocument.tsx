'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SavedQuote, PricingSettings, ServiceType } from '@/lib/types';
import { CheckCircle2, Loader2, Send, X, Eye, EyeOff } from 'lucide-react';
import { generateQuoteEmailHtml } from '@/lib/emailTemplate';

interface QuoteDocumentProps {
  quote: SavedQuote;
  settings: PricingSettings;
  showAdminControls?: boolean;
}

export function QuoteDocument({ quote, settings, showAdminControls = true }: QuoteDocumentProps) {
  const [isAdminView, setIsAdminView] = useState(showAdminControls);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sync state with prop updates
  useEffect(() => {
    setIsAdminView(showAdminControls);
  }, [showAdminControls]);

  // Auto-detect view from URL search param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'client' || params.get('client') === 'true') {
        setIsAdminView(false);
      }
    }
  }, []);

  const handleSendEstimate = async () => {
    setIsSending(true);
    setSentStatus('idle');
    try {
      const WEBHOOK_URL = 'https://webhook.infra-remakingautomacoes.cloud/webhook/estimatesc';
      const estimateUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/estimate/view?id=${quote.id}` 
        : '';
      
      const htmlContent = generateQuoteEmailHtml(quote, settings, estimateUrl);
        
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'estimate_sent',
          leadId: quote.leadId || null,
          customerName: quote.customerName || '',
          customerEmail: quote.customerEmail || '',
          customerPhone: quote.customerPhone || '',
          customerAddress: quote.customerAddress || '',
          total: quote.total,
          frequency: quote.frequency,
          serviceType: quote.serviceType,
          sqFt: quote.sqFt,
          beds: quote.beds,
          baths: quote.baths,
          extras: quote.selectedExtras || [],
          estimateUrl: estimateUrl,
          htmlContent: htmlContent
        }),
      });

      if (!response.ok) throw new Error('Failed to send estimate');
      setSentStatus('success');
      setTimeout(() => setSentStatus('idle'), 4000);
    } catch (error) {
      console.error('Failed to send estimate:', error);
      setSentStatus('error');
      setTimeout(() => setSentStatus('idle'), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // N8N Webhook for client approval
      const WEBHOOK_URL = 'https://webhook.infra-remakingautomacoes.cloud/webhook/approve-estimate';
      
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'estimate_approved',
          quoteId: quote.id,
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          total: quote.total,
          serviceType: quote.serviceType,
          frequency: quote.frequency
        }),
      });
      
      setIsApproved(true);
    } catch (error) {
      console.error('Failed to approve estimate:', error);
      // Even if webhook fails locally, for UX we can show success, 
      // or you can show an error toast.
      setIsApproved(true); 
    } finally {
      setIsApproving(false);
    }
  };

  // Calculate line items
  const areaPrice = Math.round(quote.sqFt * settings.pricePerSqFt);
  const roomsPrice = (quote.beds * settings.bedPrice) + (quote.baths * settings.bathPrice) + (quote.halfBaths * settings.halfBathPrice);
  
  const serviceNames: Record<ServiceType, string> = {
    '': 'Not Selected',
    residential: 'Residential',
    deep: 'Deep Clean',
    ttb: 'Top to Bottom',
    move: 'Move In/Out',
    vacation: 'Vacation/Airbnb',
    commercial: 'Commercial',
    construction: 'Post-Construction'
  };

  const getMultiplier = () => {
    switch(quote.serviceType) {
      case 'deep': return settings.deepCleanMultiplier;
      case 'move': return settings.moveInOutMultiplier;
      case 'vacation': return settings.vacationMultiplier;
      case 'commercial': return settings.commercialMultiplier;
      case 'construction': return settings.constructionMultiplier;
      default: return 1;
    }
  };

  const validUntil = new Date(quote.date);
  validUntil.setDate(validUntil.getDate() + 30);

  const additionalBeds = Math.max(0, quote.beds - 1);
  const bedChangeCost = (quote.selectedExtras || []).includes('sheetChange') && additionalBeds > 0
    ? additionalBeds * (settings.extras?.sheetChange || 10) 
    : 0;

  const extrasTotal = (quote.selectedExtras || []).reduce((sum, extra) => {
    if (extra === 'sheetChange') return sum; // Skip since we calculated it in bedChangeCost
    return sum + (settings.extras[extra as keyof typeof settings.extras] || 0);
  }, 0);

  let preDiscountTotal = quote.total;
  let militaryDiscountAmount = 0;
  
  if (quote.manualDiscount) {
    preDiscountTotal += quote.manualDiscount;
  }

  if (quote.militaryDiscount) {
    preDiscountTotal = Math.round(preDiscountTotal / 0.9);
    militaryDiscountAmount = preDiscountTotal - (quote.total + (quote.manualDiscount || 0));
  }

  const primaryServiceCost = Math.max(0, preDiscountTotal - extrasTotal - bedChangeCost);
  
  // Calculate standard total for recurring preview exactly like estimate/page.tsx
  const standardTotalForPreview = settings.basePrice + areaPrice + roomsPrice;
  const weeklyPrice = Math.round(standardTotalForPreview * (settings.weeklyMultiplier || 0.8));
  const biWeeklyPrice = Math.round(standardTotalForPreview * (settings.biWeeklyMultiplier || 0.85));
  const monthlyPrice = Math.round(standardTotalForPreview * (settings.monthlyMultiplier || 0.9));

  const serviceDescriptions: Record<string, string[]> = {
    residential: ["General dusting & wipe down of surfaces", "Vacuum & mop all accessible floors", "Kitchen counters & exterior of appliances", "Full bathroom sanitization", "Empty small trash bins"],
    deep: ["Everything in Residential, PLUS:", "Detailed scrubbing of kitchen and bathrooms", "Dusting reachable surfaces", "Sanitizing high touch areas"],
    ttb: ["Everything in Deep Clean, PLUS:", "Baseboards & window sills wiped by hand", "Ceiling fans & light fixtures dusted", "Extra scrubbing in high-traffic bathrooms", "Heavy dusting & cobweb removal"],
    move: ["Everything in TTB, PLUS:", "Inside all empty cabinets and drawers", "Inside all empty closets", "Inside & behind appliances (if moved)"],
    vacation: ["Check for damages & left items", "Launder all linens & remake beds", "Restock supplies (toilet paper, soap)", "Detailed clean & sanitization for next guest"],
    commercial: ["Reception & common areas", "Desk & cubicle wipe down", "Restroom maintenance", "Breakroom cleaning", "Trash removal & flooring"],
    construction: ["Heavy dust removal from all surfaces", "Paint drop & sticker removal", "Vacuum inside cabinets & drawers", "Detailed trim & baseboard wipe down"]
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Main Clean Document Sheet */}
      <div className="bg-white p-6 sm:p-10 text-zinc-900 font-sans border border-zinc-200 shadow-sm print:shadow-none print:border-none print:p-0 rounded-2xl" id="quote-document">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-6">
        <div>
          <Image 
            src="https://img1.wsimg.com/isteam/ip/97a5d835-7b16-4991-b3c6-3d6956b6b82b/ESBOC%CC%A7O-STAR-CLEANING_full.png" 
            alt="Star Cleaning SC" 
            width={160} 
            height={80} 
            className="object-contain"
            referrerPolicy="no-referrer"
            priority
          />
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <h1 className="text-3xl sm:text-4xl font-light tracking-widest text-zinc-300 uppercase mb-4">Estimate</h1>
          <div className="grid grid-cols-2 sm:grid-cols-[auto_auto] gap-x-6 gap-y-2 text-sm sm:justify-end text-left sm:text-right">
            <span className="font-medium text-zinc-500">Estimate No.</span>
            <span className="font-bold text-zinc-900">#{quote.id.split('-')[0].toUpperCase()}</span>
            
            <span className="font-medium text-zinc-500">Date</span>
            <span className="font-bold text-zinc-900">{new Date(quote.date).toLocaleDateString()}</span>
            
            <span className="font-medium text-zinc-500">Valid Until</span>
            <span className="font-bold text-zinc-900">{validUntil.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 p-6 bg-zinc-50 rounded-xl border border-zinc-100">
        <div>
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">From</h3>
          <p className="text-sm font-bold text-zinc-900 mb-1">Star Cleaning SC</p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Charleston, South Carolina<br />
            admin@starcleaningsc.com<br />
            www.starcleaningsc.com
          </p>
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Prepared For</h3>
          <p className="text-sm font-bold text-zinc-900 mb-1">{quote.customerName || 'Valued Customer'}</p>
          {quote.customerPhone && <p className="text-xs text-zinc-600">{quote.customerPhone}</p>}
          {quote.customerEmail && <p className="text-xs text-zinc-600">{quote.customerEmail}</p>}
          {quote.customerAddress && <p className="text-xs text-zinc-600 mt-1">{quote.customerAddress}</p>}
        </div>
      </div>

      {/* Service Overview */}
      <div className="mb-10">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Service Overview</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-800">
          <div>
            <h4 className="text-lg font-bold text-sky-700">{serviceNames[quote.serviceType]} Cleaning</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Comprehensive cleaning tailored to your property. Frequency: <span className="uppercase font-bold">{quote.frequency || 'one-time'}</span></p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-left sm:text-right">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase">Area</span>
              <span className="font-bold text-zinc-900">{quote.sqFt} <span className="text-xs font-normal text-zinc-500">sq ft</span></span>
            </div>
            <div className="w-px h-8 bg-zinc-200 hidden sm:block"></div>
            <div className="text-left sm:text-right">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase">Rooms</span>
              <span className="font-bold text-zinc-900">{quote.beds}B / {quote.baths + quote.halfBaths}b</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-10 overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-zinc-200 text-left">
              <th className="py-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Description</th>
              <th className="py-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px] text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            <tr>
              <td className="py-4 text-zinc-700">
                <span className="font-bold text-zinc-900 block text-base">{serviceNames[quote.serviceType as keyof typeof serviceNames]} Cleaning</span>
                <span className="text-xs text-zinc-500 mb-2 block">Complete cleaning for {quote.sqFt} sq ft, {quote.beds} Bedrooms, {quote.baths + quote.halfBaths} Bathrooms</span>
                
                <div className="bg-zinc-50 rounded-lg p-3 mt-2 border border-zinc-100">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2 block">What&apos;s included:</span>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    {serviceDescriptions[quote.serviceType]?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </td>
              <td className="py-4 text-right font-medium text-zinc-900 align-top">${primaryServiceCost}</td>
            </tr>
            {bedChangeCost > 0 && (
              <tr>
                <td className="py-3 text-zinc-700">
                  <span className="font-medium text-zinc-900 block">Sheet Change (Extra beds)</span>
                  <span className="text-xs text-zinc-500">{additionalBeds} extra {additionalBeds === 1 ? 'bed' : 'beds'}</span>
                </td>
                <td className="py-3 text-right font-medium text-zinc-900 align-top">${bedChangeCost}</td>
              </tr>
            )}
            {(quote.selectedExtras || []).filter(e => e !== 'sheetChange').length > 0 && (
              <tr>
                <td className="py-3 text-zinc-700" colSpan={2}>
                  <span className="font-bold text-xs text-zinc-400 uppercase tracking-wider block mt-2 mb-1">Add-on Services</span>
                </td>
              </tr>
            )}
            {(quote.selectedExtras || []).filter(e => e !== 'sheetChange').map(extra => (
              <tr key={extra}>
                <td className="py-3 text-zinc-700">
                  <span className="font-medium text-zinc-900 capitalize">{extra.replace(/([A-Z])/g, ' $1').trim()}</span>
                </td>
                <td className="py-3 text-right font-medium text-zinc-900 align-top">${settings.extras[extra as keyof typeof settings.extras]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className={`flex flex-col sm:flex-row ${['residential', 'deep'].includes(quote.serviceType) ? 'justify-between' : 'justify-end'} items-start sm:items-end mb-8 gap-6`}>
        {['residential', 'deep'].includes(quote.serviceType) && (
          <div className="w-full sm:w-1/2">
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </div>
              <p className="text-[10px] font-bold text-sky-800 uppercase tracking-wider mb-2 relative z-10">Recurring Discounts</p>
              <div className="space-y-1 relative z-10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sky-700 font-medium">Weekly ({Math.round((1 - (settings.weeklyMultiplier || 0.8)) * 100)}% off)</span>
                  <span className="font-bold text-sky-900">${weeklyPrice} <span className="text-[10px] font-normal text-sky-600">/visit</span></span>
                </div>
                <div className="flex items-center justify-between border-t border-sky-200/50 pt-1 mt-1">
                  <span className="text-sky-700 font-medium">Bi-weekly ({Math.round((1 - (settings.biWeeklyMultiplier || 0.85)) * 100)}% off)</span>
                  <span className="font-bold text-sky-900">${biWeeklyPrice} <span className="text-[10px] font-normal text-sky-600">/visit</span></span>
                </div>
                <div className="flex items-center justify-between border-t border-sky-200/50 pt-1 mt-1">
                  <span className="text-sky-700 font-medium">Every 4 Weeks ({Math.round((1 - (settings.monthlyMultiplier || 0.9)) * 100)}% off)</span>
                  <span className="font-bold text-sky-900">${monthlyPrice} <span className="text-[10px] font-normal text-sky-600">/visit</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full sm:w-80 bg-zinc-50 p-5 rounded-xl border border-zinc-200">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-zinc-500">{serviceNames[quote.serviceType as keyof typeof serviceNames]} Cleaning</span>
            <span className="font-medium text-zinc-900">${primaryServiceCost}</span>
          </div>
          
          {(bedChangeCost > 0 || (quote.selectedExtras || []).filter(e => e !== 'sheetChange').length > 0) && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-zinc-500">Add-ons & Extras</span>
              <span className="font-medium text-zinc-900">+ ${extrasTotal + bedChangeCost}</span>
            </div>
          )}
          
          {quote.militaryDiscount && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-emerald-600 font-medium tracking-tight">Military Discount (10%)</span>
              <span className="font-bold text-emerald-600">- ${militaryDiscountAmount}</span>
            </div>
          )}
          
          {quote.manualDiscount && quote.manualDiscount > 0 && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-sky-600 font-medium tracking-tight">Special Discount</span>
              <span className="font-bold text-sky-600">- ${quote.manualDiscount}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-zinc-200 mt-2">
            <span className="font-bold text-zinc-900 uppercase tracking-wider text-xs">Total Estimate</span>
            <span className="text-3xl font-bold text-sky-600 tracking-tight">${quote.total}</span>
          </div>
        </div>
      </div>
      
      {/* Call to Action - Workflows */}
      {isAdminView ? (
        <div className="mb-12 print:hidden flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Estimate Controls</span>
            <span className="text-xs font-semibold text-zinc-500 mt-0.5">Trigger dispatch automation or approve directly</span>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            {/* Webhook Button */}
            <button 
              type="button"
              onClick={handleSendEstimate}
              disabled={isSending}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border ${
                sentStatus === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : sentStatus === 'error'
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 border-zinc-200'
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Sending...</span>
                </>
              ) : sentStatus === 'success' ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-200" />
                  <span>Estimate Sent!</span>
                </>
              ) : sentStatus === 'error' ? (
                <>
                  <X size={18} className="text-rose-200" />
                  <span>Error Sending</span>
                </>
              ) : (
                <>
                  <Send size={18} className="text-sky-600 shrink-0" />
                  <span>Send Estimate</span>
                </>
              )}
            </button>

            {/* Approve Button */}
            {isApproved ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-5 py-3 rounded-xl font-bold border border-emerald-200 text-sm">
                <CheckCircle2 size={18} />
                Approved!
              </div>
            ) : (
              <button 
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer border border-sky-700"
              >
                {isApproving && <Loader2 className="animate-spin" size={18} />}
                Approve Estimate
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Customer-friendly Approve CTA style */
        <div className="mb-12 print:hidden flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Approve Proposal</span>
            <span className="text-xs font-medium text-emerald-600 mt-0.5">Accept terms and schedule cleaning services</span>
          </div>
          <div className="w-full sm:w-auto">
            {isApproved ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 bg-white px-6 py-3.5 rounded-xl font-bold border border-emerald-200 shadow-sm text-sm">
                <CheckCircle2 size={18} />
                Proposal Approved! 🎉
              </div>
            ) : (
              <button 
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-emerald-700"
              >
                {isApproving && <Loader2 className="animate-spin" size={18} />}
                Accept & Approve Estimate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="border-t border-zinc-200 pt-8">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Terms & Conditions</h3>
        <ul className="text-xs text-zinc-500 list-disc pl-4 space-y-2">
          <li>This estimate is valid for 30 days from the date of issue.</li>
          <li>The final price may vary slightly based on the actual condition of the property upon arrival.</li>
          <li>Payment is due in full upon completion of the cleaning service unless otherwise agreed.</li>
          <li>Please ensure our team has clear access to all areas requiring cleaning.</li>
          <li>Cancellations must be made at least 24 hours in advance to avoid a cancellation fee.</li>
        </ul>
      </div>
    </div>
  </div>
);
}
