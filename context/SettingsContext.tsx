'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PricingSettings } from '@/lib/types';
import { supabase, hasSupabase } from '@/lib/supabase';

const defaultSettings: PricingSettings = {
  basePrice: 100,
  pricePerSqFt: 0.05,
  bedPrice: 20,
  bathPrice: 30,
  halfBathPrice: 15,
  deepCleanMultiplier: 1.5,
  moveInOutMultiplier: 2.0,
  vacationMultiplier: 1.2,
  commercialMultiplier: 1.0,
  constructionMultiplier: 2.5,
  extras: {
    oven: 30,
    fridge: 30,
    windows: 50,
    laundry: 20,
    cabinets: 40,
    garage: 50,
  },
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
            const mappedSettings: PricingSettings = {
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
              extras: data.extras as any,
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
              setSettings({
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
                extras: data.extras as any,
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
