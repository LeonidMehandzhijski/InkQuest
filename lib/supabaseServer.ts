import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client using service_role key.
 * BYPASSES Row Level Security — use ONLY in API routes after 
 * your own validation (e.g., geofencing check, auth verification).
 * 
 * ⚠️ NEVER expose this client or the SERVICE_ROLE_KEY to the browser.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
