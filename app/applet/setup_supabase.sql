-- SUPABASE TABLE SETUP SCRIPT
-- Execute this script in your Supabase SQL Editor to create and configure the necessary tables.

-- 1. Create the settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id bigint PRIMARY KEY,
    base_price numeric NOT NULL DEFAULT 100,
    price_per_sq_ft numeric NOT NULL DEFAULT 0.05,
    bed_price numeric NOT NULL DEFAULT 20,
    bath_price numeric NOT NULL DEFAULT 25,
    half_bath_price numeric NOT NULL DEFAULT 15,
    deep_clean_multiplier numeric NOT NULL DEFAULT 1.5,
    move_in_out_multiplier numeric NOT NULL DEFAULT 1.8,
    vacation_multiplier numeric NOT NULL DEFAULT 1.2,
    commercial_multiplier numeric NOT NULL DEFAULT 1.0,
    construction_multiplier numeric NOT NULL DEFAULT 2.5,
    extras jsonb NOT NULL DEFAULT '{"oven": 35, "fridge": 35, "windows": 5, "laundry": 20, "cabinets": 25, "garage": 40}'::jsonb
);

-- Insert default settings row if it doesn't exist
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2. Create the quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sq_ft numeric NOT NULL,
    beds numeric NOT NULL,
    baths numeric NOT NULL,
    half_baths numeric NOT NULL,
    service_type text NOT NULL,
    frequency text,
    selected_extras jsonb,
    total numeric NOT NULL,
    customer_name text,
    customer_phone text,
    customer_email text,
    customer_address text,
    notes text,
    status text DEFAULT 'new',
    created_by_email text
);

-- 3. Set up Row Level Security (RLS) policies
-- Enable RLS on tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Enable read access for all users on settings" 
    ON public.settings FOR SELECT 
    USING (true);

-- Allow admins or anyone to update settings (Customize this later based on your auth!)
-- Note: for a simple setup we allow all, but you may want to restrict this to authenticated users.
CREATE POLICY "Enable update access for all users on settings" 
    ON public.settings FOR UPDATE 
    USING (true);
    
CREATE POLICY "Enable insert access for all users on settings" 
    ON public.settings FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to insert quotes (e.g. from the estimate form)
CREATE POLICY "Enable insert for all users on quotes" 
    ON public.quotes FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to read all quotes
CREATE POLICY "Enable read access for all users on quotes" 
    ON public.quotes FOR SELECT 
    USING (true);
    
-- Allow anyone to update their quotes
CREATE POLICY "Enable update access for all users on quotes" 
    ON public.quotes FOR UPDATE 
    USING (true);

-- Allow anyone to delete quotes
CREATE POLICY "Enable delete access for all users on quotes" 
    ON public.quotes FOR DELETE 
    USING (true);

-- 4. Enable Realtime events for tables
alter publication supabase_realtime add table public.settings;
alter publication supabase_realtime add table public.quotes;
