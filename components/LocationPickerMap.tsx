'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { MAP_DEFAULT_ZOOM } from '@/lib/constants';

interface LocationPickerMapProps {
  center: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
}

export function LocationPickerMap({ center, onLocationSelect }: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by webpack
      // @ts-expect-error -- Leaflet icon URL fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: center,
        zoom: MAP_DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
        }
      ).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationSelect(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });

      leafletMapRef.current = map;
      setIsReady(true);
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when center prop changes from outside (e.g. form edit)
  useEffect(() => {
    if (isReady && leafletMapRef.current && markerRef.current) {
      markerRef.current.setLatLng(center);
      leafletMapRef.current.setView(center);
    }
  }, [center, isReady]);

  return <div ref={mapRef} className="w-full h-full min-h-[250px] z-10" />;
}
