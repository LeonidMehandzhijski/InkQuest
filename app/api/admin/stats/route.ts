import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { AdminStats } from '@/types';

// ============================================================
// GET /api/admin/stats
// Returns dashboard statistics. Admin-only.
// ============================================================

export async function GET(): Promise<NextResponse<AdminStats | { error: string }>> {
  // 1. Verify admin role
  const cookieStore = await cookies();
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Fetch stats in parallel
  const [usersResult, scansResult, pendingBookingsResult, recentBookingsResult] =
    await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('scans').select('id', { count: 'exact', head: true }).eq('is_valid', true),
      supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin
        .from('bookings')
        .select('*, tattoo:tattoos(title, rarity), user:users(email)')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  return NextResponse.json({
    total_users: usersResult.count ?? 0,
    total_scans: scansResult.count ?? 0,
    pending_bookings: pendingBookingsResult.count ?? 0,
    recent_bookings: recentBookingsResult.data ?? [],
  });
}
