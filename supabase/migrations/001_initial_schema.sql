-- ============================================================
-- InkQuest Database Schema - Migration 001
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  guest_id    TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

COMMENT ON TABLE public.users IS 'InkQuest user profiles, linked to Supabase Auth.';
COMMENT ON COLUMN public.users.guest_id IS 'localStorage-generated ID for anonymous users.';

-- ============================================================
-- TABLE: tattoos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tattoos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  description         TEXT,
  image_url           TEXT,
  base_price          NUMERIC(10, 2),
  discount_percentage INTEGER NOT NULL DEFAULT 15 CHECK (discount_percentage BETWEEN 0 AND 100),
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tattoos IS 'Tattoo designs available in the campaign.';
COMMENT ON COLUMN public.tattoos.discount_percentage IS 'Discount rewarded when this tattoo is found. Default 15%.';

-- ============================================================
-- TABLE: locations (physical QR sticker locations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.locations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tattoo_id   UUID NOT NULL REFERENCES public.tattoos(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  hint_text   TEXT,
  qr_uuid     UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.locations IS 'Physical sticker locations. qr_uuid is embedded in the QR code URL.';
CREATE INDEX idx_locations_qr_uuid ON public.locations(qr_uuid);
CREATE INDEX idx_locations_tattoo_id ON public.locations(tattoo_id);
CREATE INDEX idx_locations_is_active ON public.locations(is_active);

-- ============================================================
-- TABLE: scans (the collection log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  guest_id    TEXT,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_valid    BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT scans_user_or_guest CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL),
  CONSTRAINT scans_unique_user_location UNIQUE (user_id, location_id),
  CONSTRAINT scans_unique_guest_location UNIQUE (guest_id, location_id)
);

COMMENT ON TABLE public.scans IS 'Records each valid QR scan. One scan per user/guest per location.';
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_guest_id ON public.scans(guest_id);
CREATE INDEX idx_scans_location_id ON public.scans(location_id);

-- ============================================================
-- TABLE: rewards (kept for admin extensibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rewards (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  required_scans      INTEGER NOT NULL DEFAULT 0,
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.rewards IS 'Optional reward tiers (kept for future admin use). Core discount is per-tattoo.';

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tattoo_id   UUID NOT NULL REFERENCES public.tattoos(id) ON DELETE CASCADE,
  reward_id   UUID REFERENCES public.rewards(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'booked', 'cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bookings IS 'Appointment booking requests.';
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
