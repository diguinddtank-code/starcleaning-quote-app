-- Create Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sq_ft INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  baths INTEGER NOT NULL,
  half_baths INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  selected_extras TEXT[] DEFAULT '{}',
  total NUMERIC NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new'
);

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
  extras JSONB NOT NULL
);

-- Insert default settings if they don't exist
INSERT INTO settings (id, base_price, price_per_sq_ft, bed_price, bath_price, half_bath_price, deep_clean_multiplier, move_in_out_multiplier, extras)
VALUES (
  1, 100, 0.05, 20, 30, 15, 1.5, 2.0,
  '{"oven": 30, "fridge": 30, "windows": 50, "laundry": 20, "cabinets": 40, "garage": 50}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
