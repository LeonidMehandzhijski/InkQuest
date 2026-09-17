import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { haversineDistance } from '@/lib/haversine';
import { GEOFENCE_RADIUS_METERS } from '@/lib/constants';
import type { ScanApiPayload, ScanApiResponse } from '@/types';

// ============================================================
// POST /api/scan
// Validates QR scan with server-side geofencing anti-cheat.
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse<ScanApiResponse>> {
  let body: ScanApiPayload;

  // --- 1. Parse & validate request body ---
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.', code: 'INVALID' },
      { status: 400 }
    );
  }

  const { qr_uuid, user_lat, user_lng, user_id, guest_id } = body;

  // Validate required fields
  if (!qr_uuid || typeof user_lat !== 'number' || typeof user_lng !== 'number') {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: qr_uuid, user_lat, user_lng.', code: 'INVALID' },
      { status: 400 }
    );
  }

  if (!user_id && !guest_id) {
    return NextResponse.json(
      { success: false, error: 'Either user_id or guest_id is required.', code: 'INVALID' },
      { status: 400 }
    );
  }

  // Validate coordinate ranges
  if (user_lat < -90 || user_lat > 90 || user_lng < -180 || user_lng > 180) {
    return NextResponse.json(
      { success: false, error: 'Invalid GPS coordinates.', code: 'INVALID' },
      { status: 400 }
    );
  }

  // --- 2. Look up location by qr_uuid ---
  const { data: location, error: locationError } = await supabaseAdmin
    .from('locations')
    .select('*, tattoo:tattoos(*)')
    .eq('qr_uuid', qr_uuid)
    .eq('is_active', true)
    .single();

  if (locationError || !location) {
    return NextResponse.json(
      { success: false, error: 'QR code not found or inactive.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  // --- 3. Haversine geofencing check ---
  const distanceMeters = haversineDistance(
    user_lat,
    user_lng,
    location.lat,
    location.lng
  );

  if (distanceMeters > GEOFENCE_RADIUS_METERS) {
    return NextResponse.json(
      {
        success: false,
        error: `You must be at the physical location to unlock this! You are ${Math.round(distanceMeters)}m away (max: ${GEOFENCE_RADIUS_METERS}m).`,
        code: 'TOO_FAR',
        distance_meters: Math.round(distanceMeters),
      },
      { status: 403 }
    );
  }

  // --- 4. Check for duplicate scan ---
  let duplicateQuery = supabaseAdmin
    .from('scans')
    .select('id')
    .eq('location_id', location.id);

  if (user_id) {
    duplicateQuery = duplicateQuery.eq('user_id', user_id);
  } else {
    duplicateQuery = duplicateQuery.eq('guest_id', guest_id!);
  }

  const { data: existingScan } = await duplicateQuery.maybeSingle();

  if (existingScan) {
    // Already scanned — return success with tattoo data (not an error, just informational)
    return NextResponse.json(
      {
        success: true,
        scan_id: existingScan.id,
        tattoo: location.tattoo,
        location: { ...location, tattoo: undefined },
        is_duplicate: true,
      },
      { status: 200 }
    );
  }

  // --- 5. Record the scan ---
  const scanRecord: Record<string, unknown> = {
    location_id: location.id,
    is_valid: true,
  };

  if (user_id) {
    scanRecord.user_id = user_id;
  } else {
    scanRecord.guest_id = guest_id;
  }

  const { data: newScan, error: scanError } = await supabaseAdmin
    .from('scans')
    .insert(scanRecord)
    .select('id')
    .single();

  if (scanError || !newScan) {
    console.error('[/api/scan] Insert error:', scanError);
    return NextResponse.json(
      { success: false, error: 'Failed to record scan. Please try again.', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }

  // --- 6. Return success with tattoo reveal data ---
  return NextResponse.json(
    {
      success: true,
      scan_id: newScan.id,
      tattoo: location.tattoo,
      location: { ...location, tattoo: undefined },
      is_duplicate: false,
    },
    { status: 200 }
  );
}
