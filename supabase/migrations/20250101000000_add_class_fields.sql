-- Migration: Add new class fields
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Add new columns to classes table
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS who_for TEXT,
  ADD COLUMN IF NOT EXISTS prerequisites TEXT,
  ADD COLUMN IF NOT EXISTS walk_away_with TEXT,
  ADD COLUMN IF NOT EXISTS what_to_bring TEXT,
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';

-- Update default cost_credits to 10
ALTER TABLE public.classes
  ALTER COLUMN cost_credits SET DEFAULT 10;

