import React from 'react';
import Image from 'next/image';
import { SavedQuote, PricingSettings } from '@/lib/types';

interface QuoteDocumentProps {
  quote: SavedQuote;
  settings: PricingSettings;
}

export function QuoteDocument({ quote, settings }: QuoteDocumentProps) {
  // Calculate line items
  const areaPrice = Math.round(quote.sqFt * settings.pricePerSqFt);
  const roomsPrice = (quote.beds * settings.bedPrice) + (quote.baths * settings.bathPrice) + (quote.halfBaths * settings.halfBathPrice);
  
  const serviceNames = {
    residential: 'Residential',
    deep: 'Deep Clean',
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

  const multiplier = getMultiplier();
  const subtotal = settings.basePrice + areaPrice + roomsPrice;
  const serviceTotal = Math.round(subtotal * multiplier);
  
  const validUntil = new Date(quote.date);
  validUntil.setDate(validUntil.getDate() + 30);

  const extrasTotal = quote.selectedExtras.reduce((sum, extra) => sum + settings.extras[extra as keyof typeof settings.extras], 0);
  
  return (
    <div className="bg-white p-6 sm:p-10 text-zinc-900 font-sans max-w-3xl mx-auto border border-zinc-200 shadow-sm print:shadow-none print:border-none print:p-0" id="quote-document">
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
            contact@starcleaningsc.com<br />
            www.starcleaningsc.com
          </p>
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Prepared For</h3>
          <p className="text-sm font-bold text-zinc-900 mb-1">{quote.customerName || 'Valued Customer'}</p>
          {quote.customerPhone && <p className="text-xs text-zinc-600">{quote.customerPhone}</p>}
        </div>
      </div>

      {/* Service Overview */}
      <div className="mb-10">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Service Overview</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-800">
          <div>
            <h4 className="text-lg font-bold text-sky-700">{serviceNames[quote.serviceType]} Cleaning</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Comprehensive cleaning tailored to your property specifications.</p>
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
              <td className="py-3 text-zinc-700">
                <span className="font-medium text-zinc-900 block">Base Service Rate</span>
                <span className="text-xs text-zinc-500">Standard starting rate for all cleanings</span>
              </td>
              <td className="py-3 text-right font-medium text-zinc-900">${settings.basePrice}</td>
            </tr>
            <tr>
              <td className="py-3 text-zinc-700">
                <span className="font-medium text-zinc-900 block">Area Adjustment</span>
                <span className="text-xs text-zinc-500">Based on {quote.sqFt} square feet</span>
              </td>
              <td className="py-3 text-right font-medium text-zinc-900">${areaPrice}</td>
            </tr>
            <tr>
              <td className="py-3 text-zinc-700">
                <span className="font-medium text-zinc-900 block">Rooms Adjustment</span>
                <span className="text-xs text-zinc-500">{quote.beds} Bedrooms, {quote.baths} Bathrooms, {quote.halfBaths} Half Baths</span>
              </td>
              <td className="py-3 text-right font-medium text-zinc-900">${roomsPrice}</td>
            </tr>
            {quote.selectedExtras.length > 0 && (
              <tr>
                <td className="py-3 text-zinc-700" colSpan={2}>
                  <span className="font-bold text-xs text-zinc-400 uppercase tracking-wider block mt-2 mb-1">Add-on Services</span>
                </td>
              </tr>
            )}
            {quote.selectedExtras.map(extra => (
              <tr key={extra}>
                <td className="py-3 text-zinc-700">
                  <span className="font-medium text-zinc-900 capitalize">{extra}</span>
                </td>
                <td className="py-3 text-right font-medium text-zinc-900">${settings.extras[extra as keyof typeof settings.extras]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-full sm:w-80 bg-zinc-50 p-5 rounded-xl border border-zinc-200">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-zinc-500">Subtotal</span>
            <span className="font-medium text-zinc-900">${subtotal}</span>
          </div>
          {multiplier !== 1 && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-zinc-500">{serviceNames[quote.serviceType]} Multiplier</span>
              <span className="font-medium text-sky-600">+ ${serviceTotal - subtotal}</span>
            </div>
          )}
          {quote.selectedExtras.length > 0 && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-zinc-500">Add-ons Total</span>
              <span className="font-medium text-zinc-900">+ ${extrasTotal}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-zinc-200 mt-2">
            <span className="font-bold text-zinc-900 uppercase tracking-wider text-xs">Total Estimate</span>
            <span className="text-3xl font-bold text-sky-600 tracking-tight">${quote.total}</span>
          </div>
        </div>
      </div>
      
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
  );
}
