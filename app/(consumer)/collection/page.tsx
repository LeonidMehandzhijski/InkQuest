'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useStore } from '@/hooks/useStore';
import { TattooCard } from '@/components/TattooCard';
import type { Location } from '@/types';

export default function CollectionPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { collectedLocationIds } = useStore();

  useEffect(() => {
    supabase
      .from('locations')
      .select('*, tattoo:tattoos(*)')
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (!error && data) {
          // Sort so collected tattoos appear first, then by creation date
          const sorted = (data as Location[]).sort((a, b) => {
            const aCollected = collectedLocationIds.includes(a.id);
            const bCollected = collectedLocationIds.includes(b.id);
            if (aCollected && !bCollected) return -1;
            if (!aCollected && bCollected) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          setLocations(sorted);
        }
        setLoading(false);
      });
  }, [collectedLocationIds]);

  const collectedCount = collectedLocationIds.length;
  const totalCount = locations.length;
  const progressPercent = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col min-h-full bg-ink-950 pt-safe px-4 pb-6">
      {/* Header */}
      <div className="py-6 text-center border-b border-ink-800 mb-6">
        <h1 className="font-display text-3xl text-gold-500 tracking-widest mb-1">INKFOLIO</h1>
        <p className="text-ink-400 text-xs font-ui uppercase tracking-widest">
          Your Discovered Tattoos
        </p>

        {/* Progress Bar */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex justify-between text-[10px] font-ui uppercase tracking-widest text-ink-300 mb-2">
            <span>Progress</span>
            <span>{collectedCount} / {totalCount} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-ink-900 rounded-full overflow-hidden border border-ink-800">
            <div
              className="h-full bg-gold-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%`, boxShadow: '0 0 10px rgba(201,168,76,0.5)' }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-ink-500 font-ui text-sm uppercase tracking-widest">
            No active tattoos found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {locations.map((loc) => {
            if (!loc.tattoo) return null;
            return (
              <TattooCard
                key={loc.id}
                tattoo={loc.tattoo}
                isCollected={collectedLocationIds.includes(loc.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
