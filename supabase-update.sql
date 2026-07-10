-- Run this in your Supabase SQL Editor to update the settings table

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_referral BOOLEAN DEFAULT false;
