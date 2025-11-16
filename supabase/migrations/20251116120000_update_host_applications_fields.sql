-- Add new fields to host_applications to support updated teacher verification form
alter table public.host_applications
  add column if not exists bio text,
  add column if not exists teach_ideas text,
  add column if not exists experiences jsonb,
  add column if not exists proof_links jsonb,
  add column if not exists rejection_feedback text;

-- Optional backfill from legacy columns if they exist
-- update public.host_applications set bio = coalesce(bio, why_host) where bio is null;
-- update public.host_applications set teach_ideas = coalesce(teach_ideas, topics) where teach_ideas is null;

-- Optionally drop old columns after verifying data migration:
-- alter table public.host_applications
--   drop column if exists why_host,
--   drop column if exists topics,
--   drop column if exists experience;


