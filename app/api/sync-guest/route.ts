import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================================
// POST /api/sync-guest
// Migrates all guest scans to an authenticated user's account.
// Called once after a guest user completes sign-up/sign-in.
// Body: { guest_id: string }
// Requires: valid Supabase auth session (JWT in cookie)
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Verify the requesting user is authenticated
  const cookieStore = await cookies();
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // read-only in this context
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Must be authenticated to sync guest data.' },
      { status: 401 }
    );
  }

  // 2. Parse body
  let guest_id: string;
  try {
    const body = await request.json();
    guest_id = body.guest_id;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!guest_id || typeof guest_id !== 'string') {
    return NextResponse.json({ error: 'guest_id is required.' }, { status: 400 });
  }

  // 3. Ensure user profile exists in public.users
  await supabaseAdmin.from('users').upsert(
    { id: user.id, email: user.email, role: 'user' },
    { onConflict: 'id' }
  );

  // 4. Find guest scans that would conflict (same location already scanned by user)
  const { data: userScans } = await supabaseAdmin
    .from('scans')
    .select('location_id')
    .eq('user_id', user.id);

  const userLocationIds = new Set((userScans || []).map((s) => s.location_id));

  // 5. Get all guest scans
  const { data: guestScans, error: fetchError } = await supabaseAdmin
    .from('scans')
    .select('id, location_id')
    .eq('guest_id', guest_id);

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to fetch guest scans.' }, { status: 500 });
  }

  if (!guestScans || guestScans.length === 0) {
    return NextResponse.json({ migrated: 0, skipped: 0 });
  }

  // 6. Split into migratable vs conflicting
  const toMigrate = guestScans.filter((s) => !userLocationIds.has(s.location_id));
  const toDelete = guestScans.filter((s) => userLocationIds.has(s.location_id));

  let migrated = 0;
  let skipped = 0;

  // 7. Migrate non-conflicting scans
  if (toMigrate.length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('scans')
      .update({ user_id: user.id, guest_id: null })
      .in('id', toMigrate.map((s) => s.id));

    if (updateError) {
      console.error('[/api/sync-guest] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to migrate guest scans.' }, { status: 500 });
    }
    migrated = toMigrate.length;
  }

  // 8. Delete conflicting guest scans (user already has them)
  if (toDelete.length > 0) {
    await supabaseAdmin
      .from('scans')
      .delete()
      .in('id', toDelete.map((s) => s.id));
    skipped = toDelete.length;
  }

  return NextResponse.json({ migrated, skipped });
}
