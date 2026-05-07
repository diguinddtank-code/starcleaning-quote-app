export type ServiceType = 'residential' | 'deep' | 'move' | 'vacation' | 'commercial' | 'construction';
export type ServiceFrequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';

export interface PricingSettings {
  basePrice: number;
  pricePerSqFt: number;
  bedPrice: number;
  bathPrice: number;
  halfBathPrice: number;
  deepCleanMultiplier: number;
  moveInOutMultiplier: number;
  vacationMultiplier: number;
  commercialMultiplier: number;
  constructionMultiplier: number;
  extras: {
    oven: number;
    fridge: number;
    windows: number;
    laundry: number;
    cabinets: number;
    garage: number;
  };
}

export interface QuoteState {
  sqFt: number;
  beds: number;
  baths: number;
  halfBaths: number;
  serviceType: ServiceType;
  frequency: ServiceFrequency;
  selectedExtras: string[];
}

export interface SavedQuote extends QuoteState {
  id: string;
  date: string;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  status?: 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost' | string;
  createdByEmail?: string;
}
