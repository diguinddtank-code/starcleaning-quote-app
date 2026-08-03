-- Create Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  "Nome" TEXT,
  "Email" TEXT,
  "Telefone" TEXT,
  "ZIP" TEXT,
  "Quartos" TEXT,
  "Banheiros" TEXT,
  "Service" TEXT,
  "Frequencia" TEXT,
  "Inicial" TEXT,
  "Final" TEXT,
  "Cidade" TEXT,
  "Data" TEXT,
  "Agendado" TEXT,
  "ETAPA" TEXT,
  "OBSERVACOES" TEXT,
  "FOLLOWUP" TEXT,
  "UMSG" TEXT,
  is_referral BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  created_by_email TEXT
);

-- Create Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lead_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  sq_ft INTEGER,
  beds INTEGER,
  baths INTEGER,
  half_baths INTEGER,
  beds_to_change INTEGER DEFAULT 0,
  selected_extras TEXT[] DEFAULT '{}',
  customer_address TEXT,
  notes TEXT,
  service_type TEXT,
  frequency TEXT,
  total NUMERIC,
  status TEXT DEFAULT 'new'
);

ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;

-- Create a bucket for storing quote PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('quote_pdfs', 'quote_pdfs', true) ON CONFLICT (id) DO NOTHING;

-- Enable public access to the quote_pdfs bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'quote_pdfs');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'quote_pdfs' AND auth.role() = 'authenticated');

-- Create Settings Table (Single row for global app settings)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  base_price NUMERIC NOT NULL,
  price_per_sq_ft NUMERIC NOT NULL,
  bed_price NUMERIC NOT NULL,
  bath_price NUMERIC NOT NULL,
  half_bath_price NUMERIC NOT NULL,
  deep_clean_multiplier NUMERIC NOT NULL,
  move_in_out_multiplier NUMERIC NOT NULL,
  vacation_multiplier NUMERIC DEFAULT 1.2,
  commercial_multiplier NUMERIC DEFAULT 1.0,
  construction_multiplier NUMERIC DEFAULT 2.5,
  weekly_multiplier NUMERIC DEFAULT 0.8,
  bi_weekly_multiplier NUMERIC DEFAULT 0.85,
  monthly_multiplier NUMERIC DEFAULT 0.9,
  extras JSONB NOT NULL
);

-- Insert default settings if they don't exist
INSERT INTO settings (
  id, base_price, price_per_sq_ft, bed_price, bath_price, half_bath_price, 
  deep_clean_multiplier, move_in_out_multiplier, 
  vacation_multiplier, commercial_multiplier, construction_multiplier,
  weekly_multiplier, bi_weekly_multiplier, monthly_multiplier,
  extras
)
VALUES (
  1, 50, 0.04, 15, 20, 10, 
  2.0, 2.5,
  1.2, 1.0, 2.5,
  0.7, 0.8, 0.9,
  '{"oven": 40, "fridge": 60, "windows": 85, "cabinets": 100, "garage": 50}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
