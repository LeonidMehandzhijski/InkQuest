'use client';

import { useEffect, useRef, useState } from 'react';
import { Navigation } from 'lucide-react';
import type { Location } from '@/types';
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_SEARCH_ZONE_RADIUS_METERS,
  MAP_ZONE_COLORS,
} from '@/lib/constants';

interface MapViewProps {
  locations: Location[];
  collectedLocationIds: string[];
}

// Leaflet must be loaded client-side only.
// We use dynamic import inside useEffect.
export function MapView({ locations, collectedLocationIds }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import('leaflet').Map | null>(null);
  const [showExactPins, setShowExactPins] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const el = mapRef.current;
    if (!el || leafletMapRef.current) return;
    // Guard against React strict-mode / HMR double-init:
    // Leaflet stamps a `_leaflet_id` on the container DOM node.
    if ((el as any)._leaflet_id != null) return;

    // Dynamic import — Leaflet uses window, must be client-only
    import('leaflet').then((L) => {
      // Double-check after async import
      if ((el as any)._leaflet_id != null) return;

      // Fix default marker icon paths broken by webpack
      // @ts-expect-error -- Leaflet icon URL fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(el, {
        center: MAP_DEFAULT_CENTER,
        zoom: MAP_DEFAULT_ZOOM,
        zoomControl: false, // we use custom controls
        attributionControl: true,
      });

      // OpenStreetMap tiles — genuinely free, no API key required
      L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom zoom control — bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMapRef.current = map;
      setIsReady(true);
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Add/update markers and zones when data or toggle changes
  useEffect(() => {
    if (!isReady || !leafletMapRef.current) return;

    const map = leafletMapRef.current;

    import('leaflet').then((L) => {
      // Clear previous layers (except tile layer)
      map.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          map.removeLayer(layer);
        }
      });

      locations.forEach((loc) => {
        const tattoo = loc.tattoo;
        if (!tattoo) return;

        const isCollected = collectedLocationIds.includes(loc.id);
        const zoneColor = getZoneColor(loc.id);
        const zoneGlow = `${zoneColor}88`;

        // --- Search Zone circle ---
        if (!showExactPins) {
          const circle = L.circle([loc.lat, loc.lng], {
            radius: MAP_SEARCH_ZONE_RADIUS_METERS,
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: isCollected ? 0.15 : 0.08,
            weight: isCollected ? 2 : 1,
            dashArray: isCollected ? undefined : '4 4',
          });

          const popupContent = buildPopupHTML(tattoo, loc, isCollected);
          circle.bindPopup(popupContent, { className: 'inkquest-popup', maxWidth: 260 });
          circle.addTo(map);
        }

        // --- Exact pin (toggle mode or collected) ---
        if (showExactPins || isCollected) {
          const svgIcon = L.divIcon({
            className: '',
            iconSize: [32, 42],
            iconAnchor: [16, 42],
            popupAnchor: [0, -42],
            html: `
              <div style="
                width:32px;height:42px;position:relative;
                filter: drop-shadow(0 0 6px ${zoneGlow});
              ">
                <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" 
                    fill="${zoneColor}" fill-opacity="${isCollected ? '0.9' : '0.5'}"/>
                  <circle cx="16" cy="16" r="6" fill="#0a0a0a"/>
                </svg>
              </div>
            `,
          });

          const marker = L.marker([loc.lat, loc.lng], { icon: svgIcon });
          const popupContent = buildPopupHTML(tattoo, loc, isCollected);
          marker.bindPopup(popupContent, { className: 'inkquest-popup', maxWidth: 260 });
          marker.addTo(map);
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, locations, collectedLocationIds, showExactPins]);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Toggle control */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          id="map-pin-toggle"
          onClick={() => setShowExactPins((v) => !v)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded text-xs font-ui uppercase tracking-wider
            border transition-all duration-200
            ${showExactPins
              ? 'bg-gold-500 text-ink-950 border-gold-400'
              : 'bg-ink-800 text-ink-200 border-ink-600 hover:border-gold-600'
            }
          `}
          aria-label={showExactPins ? 'Switch to Search Zones' : 'Show Exact Pins'}
        >
          <Navigation size={14} />
          {showExactPins ? 'Exact Pins' : 'Search Zones'}
        </button>
      </div>

    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPopupHTML(tattoo: any, loc: any, isCollected: boolean): string {
  const imgSection = isCollected && tattoo.image_url
    ? `<img src="${tattoo.image_url}" alt="${tattoo.title}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:8px;"/>`
    : `<div style="
        width:100%;height:80px;border-radius:4px;margin-bottom:8px;
        background:#1a1a1a;display:flex;align-items:center;justify-content:center;
        filter:blur(4px) brightness(0.4);
        background-image:${tattoo.image_url ? `url(${tattoo.image_url})` : 'none'};
        background-size:cover;background-position:center;
      "><span style="font-size:24px;filter:none;">🖋️</span></div>`;

  return `
    <div style="
      background:#1a1a1a;border:1px solid #3d3d3d;border-radius:8px;
      padding:12px;min-width:200px;font-family:sans-serif;
    ">
      ${imgSection}
      <p style="color:#e0e0d8;font-weight:600;font-size:13px;margin:0 0 4px;">
        ${isCollected ? tattoo.title : '???  Unknown Design'}
      </p>
      ${isCollected
        ? `<p style="color:#c9a84c;font-size:11px;margin:0;">${tattoo.discount_percentage}% discount unlocked!</p>`
        : `<p style="color:#5a5a5a;font-size:11px;margin:0;">${loc.hint_text || 'Find the QR sticker nearby...'}</p>`
      }
    </div>
  `;
}

function getZoneColor(locationId: string): string {
  const hash = Array.from(locationId).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0);
  return MAP_ZONE_COLORS[hash % MAP_ZONE_COLORS.length];
}
