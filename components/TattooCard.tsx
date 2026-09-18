'use client';

import Image from 'next/image';
import { Lock } from 'lucide-react';
import type { Tattoo } from '@/types';

interface TattooCardProps {
  tattoo: Tattoo;
  isCollected: boolean;
}

export function TattooCard({ tattoo, isCollected }: TattooCardProps) {
  return (
    <div
      className={`relative w-full aspect-[3/4] rounded-xl border-2 overflow-hidden flex flex-col transition-all duration-300 ${
        isCollected ? 'opacity-100' : 'opacity-80 scale-[0.98]'
      }`}
      style={{
        borderColor: isCollected ? '#c9a84c' : '#2e2e2e',
        boxShadow: isCollected ? '0 4px 20px rgba(201,168,76,0.28)' : 'none',
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
