import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client (uses anon key + RLS).
 * Use in Client Components and hooks.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
