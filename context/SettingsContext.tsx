'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PricingSettings, PricingTier } from '@/lib/types';
import { supabase, hasSupabase } from '@/lib/supabase';

const defaultPricingTiers: PricingTier[] = [
  { sqftLabel: "Up to 1200", minSqft: 0, maxSqft: 1200, recurring: { weekly: { min: 105, max: 135 }, biWeekly: { min: 120, max: 150 }, monthly: { min: 163, max: 179 } }, details: [ { beds: 1, baths: 1, deep: { min: 280, max: 298 }, moveInOut: { min: 315, max: 385 }, general: { min: 225, max: 263 } }, { beds: 2, baths: 2, deep: { min: 315, max: 333 }, moveInOut: { min: 385, max: 455 }, general: { min: 281, max: 300 } } ] },
  { sqftLabel: "1200 to 1499", minSqft: 1201, maxSqft: 1499, recurring: { weekly: { min: 135, max: 150 }, biWeekly: { min: 150, max: 165 }, monthly: { min: 179, max: 195 } }, details: [ { beds: 3, baths: 2, deep: { min: 333, max: 350 }, moveInOut: { min: 420, max: 490 }, general: { min: 300, max: 319 } }, { beds: 3, baths: 2.5, deep: { min: 368, max: 385 }, moveInOut: { min: 490, max: 525 }, general: { min: 338, max: 356 } } ] },
  { sqftLabel: "1500 to 1850", minSqft: 1500, maxSqft: 1850, recurring: { weekly: { min: 150, max: 165 }, biWeekly: { min: 165, max: 195 }, monthly: { min: 211, max: 228 } }, details: [ { beds: 3, baths: 2.5, deep: { min: 420, max: 438 }, moveInOut: { min: 508, max: 525 }, general: { min: 356, max: 375 } }, { beds: 4, baths: 3, deep: { min: 455, max: 490 }, moveInOut: { min: 543, max: 560 }, general: { min: 371, max: 386 } } ] },
  { sqftLabel: "1851 to 2200", minSqft: 1851, maxSqft: 2200, recurring: { weekly: { min: 165, max: 180 }, biWeekly: { min: 180, max: 210 }, monthly: { min: 211, max: 228 } }, details: [ { beds: 3, baths: 2, deep: { min: 473, max: 508 }, moveInOut: { min: 543, max: 595 }, general: { min: 413, max: 431 } }, { beds: 4, baths: 2.5, deep: { min: 525, max: 543 }, moveInOut: { min: 578, max: 613 }, general: { min: 450, max: 469 } } ] },
  { sqftLabel: "2201 to 2600", minSqft: 2201, maxSqft: 2600, recurring: { weekly: { min: 171, max: 189 }, biWeekly: { min: 189, max: 225 }, monthly: { min: 228, max: 260 } }, details: [ { beds: 4, baths: 2.5, deep: { min: 560, max: 595 }, moveInOut: { min: 613, max: 648 }, general: { min: 469, max: 488 } }, { beds: 4, baths: 3, deep: { min: 630, max: 700 }, moveInOut: { min: 630, max: 665 }, general: { min: 506, max: 525 } } ] },
  { sqftLabel: "2601 to 3000", minSqft: 2601, maxSqft: 3000, recurring: { weekly: { min: 195, max: 225 }, biWeekly: { min: 225, max: 240 }, monthly: { min: 276, max: 293 } }, details: [ { beds: 4, baths: 3, deep: { min: 630, max: 700 }, moveInOut: { min: 665, max: 735 }, general: { min: 525, max: 544 } }, { beds: 4, baths: 3.5, deep: { min: 770, max: 840 }, moveInOut: { min: 700, max: 770 }, general: { min: 544, max: 581 } } ] },
  { sqftLabel: "3001 to 3300", minSqft: 3001, maxSqft: 3300, recurring: { weekly: { min: 225, max: 255 }, biWeekly: { min: 240, max: 270 }, monthly: { min: 293, max: 309 } }, details: [ { beds: 4, baths: 3.5, deep: { min: 770, max: 840 }, moveInOut: { min: 770, max: 910 }, general: { min: 600, max: 619 } }, { beds: 5, baths: 4, deep: { min: 910, max: 980 }, moveInOut: { min: 805, max: 945 }, general: { min: 638, max: 656 } } ] },
  { sqftLabel: "3301 to 3900", minSqft: 3301, maxSqft: 3900, recurring: { weekly: { min: 255, max: 330 }, biWeekly: { min: 270, max: 330 }, monthly: { min: 358, max: 423 } }, details: [ { beds: 5, baths: 3.5, deep: { min: 840, max: 910 }, moveInOut: { min: 945, max: 1085 }, general: { min: 656, max: 694 } }, { beds: 5, baths: 4.5, deep: { min: 980, max: 1050 }, moveInOut: { min: 1050, max: 1190 }, general: { min: 713, max: 731 } } ] },
  { sqftLabel: "3901 to 5000", minSqft: 3901, maxSqft: 5000, recurring: { weekly: { min: 420, max: 480 }, biWeekly: { min: 360, max: 480 }, monthly: { min: 520, max: 585 } }, details: [ { beds: 5, baths: 4, deep: { min: 1050, max: 1120 }, moveInOut: { min: 1190, max: 1330 }, general: { min: 750, max: 769 } }, { beds: 6, baths: 5, deep: { min: 1190, max: 1260 }, moveInOut: { min: 1330, max: 1470 }, general: { min: 788, max: 806 } } ] },
  { sqftLabel: "5001 to 6000", minSqft: 5001, maxSqft: 6000, recurring: { weekly: { min: 480, max: 480 }, biWeekly: { min: 480, max: 480 }, monthly: { min: 650, max: 650 } }, details: [ { beds: 6, baths: 5, deep: { min: 1260, max: 1400 }, moveInOut: { min: 1400, max: 1820 }, general: { min: 825, max: 844 } } ] },
  { sqftLabel: "6001 to 7900", minSqft: 6001, maxSqft: 7900, recurring: { weekly: { min: 600, max: 600 }, biWeekly: { min: 600, max: 600 }, monthly: { min: 780, max: 780 } }, details: [ { beds: 6, baths: 5, deep: { min: 1400, max: 1540 }, moveInOut: { min: 1820, max: 2100 }, general: { min: 863, max: 881 } } ] },
  { sqftLabel: "7901 to 9000", minSqft: 7901, maxSqft: 9000, recurring: { weekly: { min: 720, max: 720 }, biWeekly: { min: 720, max: 720 }, monthly: { min: 910, max: 910 } }, details: [ { beds: 6, baths: 5, deep: { min: 1540, max: 1820 }, moveInOut: { min: 2100, max: 2520 }, general: { min: 900, max: 919 } } ] }
];

const defaultSettings: PricingSettings = {
  pricingTiers: defaultPricingTiers,
  basePrice: 50,
  pricePerSqFt: 0.04,
  bedPrice: 15,
  bathPrice: 20,
  halfBathPrice: 10,
  deepCleanMultiplier: 2.0,
  moveInOutMultiplier: 2.5,
  vacationMultiplier: 1.2,
  commercialMultiplier: 1.0,
  constructionMultiplier: 2.5,
  weeklyMultiplier: 0.7,
  biWeeklyMultiplier: 0.8,
  monthlyMultiplier: 0.9,
  extras: {
    oven: 40,
    fridge: 60,
    windows: 85,
    cabinets: 100,
    garage: 50,
    bedChange: 10,
    sheetChange: 10
  },
  campaign: {
    name: '',
    startDate: '',
    endDate: '',
    discountPercent: 0,
    description: '',
    imageUrl: ''
  }
};

interface SettingsContextType {
  settings: PricingSettings;
  updateSettings: (newSettings: PricingSettings) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PricingSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let subscription: any = null;

    const loadSettings = async () => {
      if (hasSupabase && supabase) {
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

          if (data && !error) {
            const defaultExtras = { oven: 40, fridge: 60, windows: 85, cabinets: 100, garage: 50, bedChange: 10 };
            const mappedSettings: PricingSettings = {
              pricingTiers: data.pricing_tiers ? (typeof data.pricing_tiers === 'string' ? JSON.parse(data.pricing_tiers) : data.pricing_tiers) : defaultPricingTiers,
              basePrice: Number(data.base_price),
              pricePerSqFt: Number(data.price_per_sq_ft),
              bedPrice: Number(data.bed_price),
              bathPrice: Number(data.bath_price),
              halfBathPrice: Number(data.half_bath_price),
              deepCleanMultiplier: Number(data.deep_clean_multiplier),
              moveInOutMultiplier: Number(data.move_in_out_multiplier),
              vacationMultiplier: Number(data.vacation_multiplier || 1.2),
              commercialMultiplier: Number(data.commercial_multiplier || 1.0),
              constructionMultiplier: Number(data.construction_multiplier || 2.5),
              weeklyMultiplier: Number(data.weekly_multiplier || 0.8),
              biWeeklyMultiplier: Number(data.bi_weekly_multiplier || 0.85),
              monthlyMultiplier: Number(data.monthly_multiplier || 0.9),
              campaign: data.campaign ? (typeof data.campaign === 'string' ? JSON.parse(data.campaign) : data.campaign) : defaultSettings.campaign,
              extras: { ...defaultExtras, ...(data.extras || {}) } as any,
            };
            setSettings(mappedSettings);
          }
        } catch (e) {
          console.error('Failed to load settings from Supabase', e);
        }

        // Subscribe to changes
        subscription = supabase
          .channel(`settings_changes_${Math.random()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
            const data = payload.new as any;
            if (data && data.id === 1) {
              const defaultExtras = { oven: 40, fridge: 60, windows: 85, cabinets: 100, garage: 50, bedChange: 10 };
              setSettings({
                pricingTiers: data.pricing_tiers ? (typeof data.pricing_tiers === 'string' ? JSON.parse(data.pricing_tiers) : data.pricing_tiers) : defaultPricingTiers,
                basePrice: Number(data.base_price),
                pricePerSqFt: Number(data.price_per_sq_ft),
                bedPrice: Number(data.bed_price),
                bathPrice: Number(data.bath_price),
                halfBathPrice: Number(data.half_bath_price),
                deepCleanMultiplier: Number(data.deep_clean_multiplier),
                moveInOutMultiplier: Number(data.move_in_out_multiplier),
                vacationMultiplier: Number(data.vacation_multiplier || 1.2),
                commercialMultiplier: Number(data.commercial_multiplier || 1.0),
                constructionMultiplier: Number(data.construction_multiplier || 2.5),
                weeklyMultiplier: Number(data.weekly_multiplier || 0.8),
                biWeeklyMultiplier: Number(data.bi_weekly_multiplier || 0.85),
                monthlyMultiplier: Number(data.monthly_multiplier || 0.9),
                campaign: data.campaign ? (typeof data.campaign === 'string' ? JSON.parse(data.campaign) : data.campaign) : defaultSettings.campaign,
                extras: { ...defaultExtras, ...(data.extras || {}) } as any,
              });
            }
          })
          .subscribe();
      } else {
        // Fallback to local storage
        const saved = localStorage.getItem('starCleaningSettings');
        if (saved) {
          try {
            setSettings(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse settings', e);
          }
        }
      }
      setIsLoaded(true);
    };

    loadSettings();

    return () => {
      if (subscription) {
        supabase?.removeChannel(subscription);
      }
    };
  }, []);

  const updateSettings = async (newSettings: PricingSettings) => {
    setSettings(newSettings);
    
    if (hasSupabase && supabase) {
      try {
        await supabase.from('settings').upsert({
          id: 1,
          pricing_tiers: newSettings.pricingTiers,
          base_price: newSettings.basePrice,
          price_per_sq_ft: newSettings.pricePerSqFt,
          bed_price: newSettings.bedPrice,
          bath_price: newSettings.bathPrice,
          half_bath_price: newSettings.halfBathPrice,
          deep_clean_multiplier: newSettings.deepCleanMultiplier,
          move_in_out_multiplier: newSettings.moveInOutMultiplier,
          vacation_multiplier: newSettings.vacationMultiplier,
          commercial_multiplier: newSettings.commercialMultiplier,
          construction_multiplier: newSettings.constructionMultiplier,
          weekly_multiplier: newSettings.weeklyMultiplier,
          bi_weekly_multiplier: newSettings.biWeeklyMultiplier,
          monthly_multiplier: newSettings.monthlyMultiplier,
          campaign: newSettings.campaign,
          extras: newSettings.extras,
        });
      } catch (e) {
        console.error('Failed to update settings in Supabase', e);
      }
    } else {
      localStorage.setItem('starCleaningSettings', JSON.stringify(newSettings));
    }
  };

  const resetSettings = () => {
    updateSettings(defaultSettings);
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
