-- Run this in your Supabase SQL Editor to update the settings table

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;
