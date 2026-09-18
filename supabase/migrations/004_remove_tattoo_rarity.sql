-- InkQuest no longer ranks tattoo designs by rarity.
-- Run this after the existing migrations for an already-live project.
ALTER TABLE public.tattoos
  DROP COLUMN IF EXISTS rarity;
