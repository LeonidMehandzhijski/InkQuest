'use client';

import Image from 'next/image';
import { Star, Lock } from 'lucide-react';
import type { Tattoo } from '@/types';
import { RARITY_CONFIG } from '@/lib/constants';

interface TattooCardProps {
  tattoo: Tattoo;
  isCollected: boolean;
}

export function TattooCard({ tattoo, isCollected }: TattooCardProps) {
  const rarityConf = RARITY_CONFIG[tattoo.rarity];

  return (
    <div
      className={`relative w-full aspect-[3/4] rounded-xl border-2 overflow-hidden flex flex-col transition-all duration-300 ${
        isCollected ? 'opacity-100' : 'opacity-80 scale-[0.98]'
      }`}
      style={{
        borderColor: isCollected ? rarityConf.color : '#2e2e2e',
        boxShadow: isCollected ? `0 4px 20px ${rarityConf.glow}` : 'none',
      }}
    >
      {/* Image / Silhouette */}
      <div className="relative flex-1 bg-ink-800">
        {isCollected ? (
          tattoo.image_url ? (
            <Image
              src={tattoo.image_url}
              alt={tattoo.title}
              fill
              className="object-cover"
              sizes="(max-width: 400px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-30">🖋️</span>
            </div>
          )
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-ink-900"
            style={{
              backgroundImage: tattoo.image_url ? `url(${tattoo.image_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(8px) brightness(0.25) grayscale(100%)',
            }}
          >
            <Lock size={32} className="text-ink-600 z-10" />
          </div>
        )}

        {/* Rarity badge (only if collected) */}
        {isCollected && (
          <div className="absolute top-2 left-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-ui uppercase tracking-wider"
              style={{
                background: 'rgba(10,10,10,0.85)',
                border: `1px solid ${rarityConf.color}`,
                color: rarityConf.color,
              }}
            >
              <Star size={8} fill="currentColor" />
              {rarityConf.label}
            </span>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className={`p-3 border-t ${isCollected ? 'bg-ink-900 border-ink-800' : 'bg-ink-950 border-ink-900'}`}>
        <h3
          className={`font-display text-lg tracking-widest truncate ${
            isCollected ? 'text-ink-100' : 'text-ink-500'
          }`}
        >
          {isCollected ? tattoo.title : '???'}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          <p className={`font-ui text-[10px] uppercase tracking-wider ${isCollected ? 'text-gold-500' : 'text-ink-600'}`}>
            {isCollected ? `${tattoo.discount_percentage}% OFF` : 'Locked'}
          </p>
        </div>
      </div>
    </div>
  );
}
