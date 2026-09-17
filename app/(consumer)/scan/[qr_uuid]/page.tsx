'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { UnlockReveal } from '@/components/UnlockReveal';
import { useStore } from '@/hooks/useStore';
import { getOrCreateGuestId } from '@/lib/guestId';
import type { ScanApiPayload, ScanApiResponse } from '@/types';

type ScanState = 'locating' | 'verifying' | 'success' | 'error';

export default function DeepLinkScanPage({ params }: { params: Promise<{ qr_uuid: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [state, setState] = useState<ScanState>('locating');
  const [errorMsg, setErrorMsg] = useState('');
  const [distance, setDistance] = useState<number | null>(null);

  const { user, setGuestId, addCollectedLocation, pendingUnlock, setPendingUnlock, clearPendingUnlock } = useStore();

  useEffect(() => {
    let isMounted = true;

    async function processScan() {
      const guestId = getOrCreateGuestId();
      if (guestId) setGuestId(guestId);

      if (!navigator.geolocation) {
        if (isMounted) {
          setErrorMsg('Geolocation is not supported by your browser.');
          setState('error');
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          setState('verifying');

          const payload: ScanApiPayload = {
            qr_uuid: resolvedParams.qr_uuid,
            user_lat: position.coords.latitude,
            user_lng: position.coords.longitude,
            user_id: user?.id,
            guest_id: guestId || undefined,
          };

          try {
            const res = await fetch('/api/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const data = (await res.json()) as ScanApiResponse;

            if (!isMounted) return;

            if (data.success) {
              addCollectedLocation(data.location.id);
              setPendingUnlock({
                tattoo: data.tattoo,
                locationId: data.location.id,
                isNew: !data.is_duplicate,
              });
              setState('success');
            } else {
              setErrorMsg(data.error);
              if (data.distance_meters !== undefined) {
                setDistance(data.distance_meters);
              }
              setState('error');
            }
          } catch (err) {
            if (!isMounted) return;
            setErrorMsg('Network error. Please check your connection and try again.');
            setState('error');
          }
        },
        (error) => {
          if (!isMounted) return;
          let msg = 'Failed to get your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location access denied. Please allow location services to verify you are at the spot.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out.';
          }
          setErrorMsg(msg);
          setState('error');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

    processScan();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.qr_uuid]);

  const handleCloseReveal = () => {
    clearPendingUnlock();
    router.push('/collection');
  };

  return (
    <div className="flex flex-col h-dvh bg-ink-950 pt-safe items-center justify-center p-6 text-center">
      {state === 'locating' && (
        <>
          <MapPin size={48} className="text-gold-500 animate-bounce mb-6" />
          <h1 className="font-display text-2xl text-ink-100 tracking-widest mb-2">Locating You</h1>
          <p className="text-ink-400 font-ui text-sm uppercase tracking-widest max-w-xs">
            Please allow location access to verify you are at the sticker.
          </p>
        </>
      )}

      {state === 'verifying' && (
        <>
          <Loader2 size={48} className="text-gold-500 animate-spin mb-6" />
          <h1 className="font-display text-2xl text-ink-100 tracking-widest mb-2">Verifying Location</h1>
          <p className="text-ink-400 font-ui text-sm uppercase tracking-widest max-w-xs">
            Checking coordinates...
          </p>
        </>
      )}

      {state === 'error' && (
        <>
          <AlertCircle size={56} className="text-red-400 mb-6" />
          <h1 className="font-display text-2xl text-ink-100 tracking-widest mb-2">Verification Failed</h1>
          <p className="text-ink-300 font-body text-sm mb-6 max-w-xs leading-relaxed">
            {errorMsg}
          </p>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-ink-800 border border-ink-600 text-ink-100 font-ui text-sm uppercase tracking-widest rounded hover:border-ink-400 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/map')}
              className="w-full py-3 bg-transparent border border-transparent text-ink-400 font-ui text-sm uppercase tracking-widest rounded hover:text-ink-200 transition-colors"
            >
              Back to Map
            </button>
          </div>
        </>
      )}

      {/* Success is handled by the UnlockReveal overlay */}
      {state === 'success' && pendingUnlock && (
        <UnlockReveal
          tattoo={pendingUnlock.tattoo}
          isNew={pendingUnlock.isNew}
          onClose={handleCloseReveal}
        />
      )}
    </div>
  );
}
