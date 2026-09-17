-- ============================================================
-- InkQuest RLS Policies - Migration 002
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tattoos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Check if requesting user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- users table policies
-- ============================================================
CREATE POLICY "users: read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users: update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user'); -- cannot self-promote to admin

CREATE POLICY "users: insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users: admin read all"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- tattoos table policies (public read for active, admin write)
-- ============================================================
CREATE POLICY "tattoos: public read active"
  ON public.tattoos FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "tattoos: admin read all"
  ON public.tattoos FOR SELECT
  USING (public.is_admin());

CREATE POLICY "tattoos: admin insert"
  ON public.tattoos FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "tattoos: admin update"
  ON public.tattoos FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "tattoos: admin delete"
  ON public.tattoos FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- locations table policies (public read for active, admin write)
-- ============================================================
CREATE POLICY "locations: public read active"
  ON public.locations FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "locations: admin read all"
  ON public.locations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "locations: admin insert"
  ON public.locations FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "locations: admin update"
  ON public.locations FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "locations: admin delete"
  ON public.locations FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- scans table policies
-- Authenticated: own rows. Guest: row must match guest_id claim.
-- INSERT via service role only (API route uses service key).
-- ============================================================
CREATE POLICY "scans: authenticated read own"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "scans: admin read all"
  ON public.scans FOR SELECT
  USING (public.is_admin());

-- Note: INSERT and UPDATE on scans is done ONLY via API routes
-- that use the service_role key, bypassing RLS entirely.
-- This is intentional — the server validates geofencing before inserting.

-- ============================================================
-- rewards table policies (public read for active, admin write)
-- ============================================================
CREATE POLICY "rewards: public read active"
  ON public.rewards FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "rewards: admin all"
  ON public.rewards FOR ALL
  USING (public.is_admin());

-- ============================================================
-- bookings table policies
-- ============================================================
CREATE POLICY "bookings: users read own"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bookings: users insert own"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings: admin all"
  ON public.bookings FOR ALL
  USING (public.is_admin());

-- ============================================================
-- Auto-create user profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
