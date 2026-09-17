'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { useStore } from '@/hooks/useStore';
import { getOrCreateGuestId } from '@/lib/guestId';
import type { Location } from '@/types';
import { STUDIO_NAME } from '@/lib/constants';

// Leaflet map must be loaded with SSR disabled
const MapView = dynamic(
  () => import('@/components/MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-ink-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-ink-400 text-sm font-ui uppercase tracking-wider">Loading map…</p>
        </div>
      </div>
    ),
  }
);

export function MapPageClient() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { collectedLocationIds, setGuestId } = useStore();

  useEffect(() => {
    // Ensure guest ID exists
    const gid = getOrCreateGuestId();
    if (gid) setGuestId(gid);

    // Fetch active locations with joined tattoo data
    supabase
      .from('locations')
      .select('*, tattoo:tattoos(*)')
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load locations:', error);
        } else {
          setLocations((data as Location[]) || []);
        }
        setLoading(false);
      });
  }, [setGuestId]);

  return (
    <div className="relative w-full h-dvh">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="pt-safe px-4 pt-4">
          <div className="bg-ink-900/80 backdrop-blur-sm border border-ink-700 rounded px-4 py-2 inline-block">
            <h1 className="font-display text-gold-500 text-lg tracking-widest">{STUDIO_NAME}</h1>
            <p className="text-ink-400 text-[10px] font-ui uppercase tracking-widest -mt-1">
              {loading ? 'Loading zones...' : `${locations.length} active zone${locations.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </header>

      {/* Map */}
      <MapView
        locations={locations}
        collectedLocationIds={collectedLocationIds}
      />
    </div>
  );
}
