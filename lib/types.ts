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
  weeklyMultiplier: number;
  biWeeklyMultiplier: number;
  monthlyMultiplier: number;
  extras: {
    oven: number;
    fridge: number;
    windows: number;
    cabinets: number;
    garage: number;
    bedChange: number;
  };
}

export interface Lead {
  id: string;
  created_at?: string;
  updated_at?: string;
  Nome?: string;
  Email?: string;
  Telefone?: string;
  ZIP?: string;
  Quartos?: string;
  Banheiros?: string;
  Service?: string;
  Frequencia?: string;
  Inicial?: string;
  Final?: string;
  Cidade?: string;
  Data?: string;
  Agendado?: string;
  ETAPA?: string;
  OBSERVACOES?: string;
  FOLLOWUP?: string;
  UMSG?: string;
  REMINDER_DATE?: string;
  created_by_email?: string;
}

export interface QuoteState {
  sqFt: number;
  beds: number;
  baths: number;
  halfBaths: number;
  bedsToChange: number;
  serviceType: ServiceType;
  frequency: ServiceFrequency;
  selectedExtras: string[];
}

export interface SavedQuote extends QuoteState {
  id: string;
  leadId?: string;
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
