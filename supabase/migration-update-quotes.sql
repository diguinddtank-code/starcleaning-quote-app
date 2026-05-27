-- Migration script to update existing quotes to the new format

-- 1. Add missing columns that support the new estimate format
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS beds_to_change INTEGER DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS selected_extras JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Update existing records with default values to ensure they are compatible with the new format 
UPDATE public.quotes 
SET 
  beds_to_change = 0 
WHERE beds_to_change IS NULL;

UPDATE public.quotes 
SET 
  selected_extras = '[]'::jsonb 
WHERE selected_extras IS NULL;

-- 3. If there's any need to update the Lead table to reflect standardized format (for example, setting ETAPA)
-- UPDATE public.leads SET "ETAPA" = 'cotado' WHERE "Inicial" IS NOT NULL AND "ETAPA" = 'novo';
