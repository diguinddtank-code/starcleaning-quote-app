'use client';

import { useSettings } from '@/context/SettingsContext';
import { useState } from 'react';
import { Save, RotateCcw, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    alert('Settings synchronized successfully!');
  };

  const handleChange = (key: string, value: number, isExtra = false) => {
    if (isExtra) {
      setLocalSettings(prev => ({
        ...prev,
        extras: { ...prev.extras, [key]: value }
      }));
    } else {
      setLocalSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-green-500" size={20} />
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Pricing Configuration</h1>
          </div>
          <p className="text-sm text-zinc-500">Adjust base rates and multipliers. Changes sync to all users.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetSettings} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-sm font-semibold transition-colors">
            <RotateCcw size={16} /> Revert
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Save size={16} /> Sync Changes
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6">Base Rates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Base Price ($)</label>
              <input type="number" value={localSettings.basePrice} onChange={(e) => handleChange('basePrice', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Price per SqFt ($)</label>
              <input type="number" step="0.01" value={localSettings.pricePerSqFt} onChange={(e) => handleChange('pricePerSqFt', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Price per Bedroom ($)</label>
              <input type="number" value={localSettings.bedPrice} onChange={(e) => handleChange('bedPrice', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Price per Bathroom ($)</label>
              <input type="number" value={localSettings.bathPrice} onChange={(e) => handleChange('bathPrice', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Price per Half Bath ($)</label>
              <input type="number" value={localSettings.halfBathPrice} onChange={(e) => handleChange('halfBathPrice', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6">Service Multipliers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Deep Clean (x)</label>
              <input type="number" step="0.1" value={localSettings.deepCleanMultiplier} onChange={(e) => handleChange('deepCleanMultiplier', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Move In/Out (x)</label>
              <input type="number" step="0.1" value={localSettings.moveInOutMultiplier} onChange={(e) => handleChange('moveInOutMultiplier', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Vacation/Airbnb (x)</label>
              <input type="number" step="0.1" value={localSettings.vacationMultiplier} onChange={(e) => handleChange('vacationMultiplier', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Commercial (x)</label>
              <input type="number" step="0.1" value={localSettings.commercialMultiplier} onChange={(e) => handleChange('commercialMultiplier', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Post-Construction (x)</label>
              <input type="number" step="0.1" value={localSettings.constructionMultiplier} onChange={(e) => handleChange('constructionMultiplier', Number(e.target.value))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6">Add-on Pricing ($)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Object.entries(localSettings.extras).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 capitalize">{key}</label>
                <input type="number" value={value} onChange={(e) => handleChange(key, Number(e.target.value), true)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
