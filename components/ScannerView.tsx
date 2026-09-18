'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Camera } from 'lucide-react';

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'error';

export function ScannerView() {
  const router = useRouter();
  const [state, setState] = useState<ScannerState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;

    try {
      await scanner.stop();
    } catch {
      // The video stream may already have stopped while navigating away.
    }
    try {
      await scanner.clear();
    } catch {
      // Clearing an already-removed scanner is safe to ignore.
    }
  };

  const startScanner = () => {
    hasScannedRef.current = false;
    setErrorMsg('');
    // Rendering the reader first is essential on mobile browsers: Html5Qrcode
    // needs a real, visible element before it can request the rear camera.
    setState('requesting');
  };

  useEffect(() => {
    if (state !== 'requesting') return;

    let cancelled = false;

    const bootScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        const onSuccess = async (decodedText: string) => {
          const match = decodedText.match(/\/scan\/([0-9a-f-]{36})/i);
          if (!match || hasScannedRef.current) return;

          hasScannedRef.current = true;
          await stopScanner();
          router.push('/scan/' + match[1]);
        };

        try {
          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
            onSuccess,
            () => undefined
          );
        } catch (rearCameraError) {
          // Some Android and iOS browsers do not honour facingMode. Fall back
          // to an enumerated camera rather than leaving the scanner unusable.
          const cameras = await Html5Qrcode.getCameras();
          const fallback = cameras.find((camera) => /back|rear|environment/i.test(camera.label)) ?? cameras[0];
          if (!fallback) throw rearCameraError;

          await scanner.start(
            fallback.id,
            { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
            onSuccess,
            () => undefined
          );
        }

        if (!cancelled) setState('scanning');
      } catch (err: unknown) {
        await stopScanner();
        if (cancelled) return;

        const message = err instanceof Error ? err.message : String(err);
        if (/permission|notallowed|denied/i.test(message)) {
          setErrorMsg('Camera access was blocked. Allow camera access for InkQuest in your browser settings, then try again.');
        } else if (/secure|https/i.test(message)) {
          setErrorMsg('Camera scanning needs a secure HTTPS connection. Open the live InkQuest site, not a local or preview link.');
        } else {
          setErrorMsg('Could not start the camera: ' + message);
        }
        setState('error');
      }
    };

    bootScanner();

    return () => {
      cancelled = true;
      // Do not stop here: changing from "opening" to "scanning" reruns this
      // effect, and stopping at that point leaves an authorised camera black.
      // The unmount cleanup and explicit Stop button own stream teardown.
    };
  }, [router, state]);

  useEffect(() => () => {
    void stopScanner();
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-ink-950 pt-safe">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h1 className="font-display text-2xl text-gold-500 tracking-widest">SCAN</h1>
          <p className="text-ink-400 text-xs font-ui uppercase tracking-widest">Find a QR sticker</p>
        </div>
        <Camera size={28} className="text-ink-600" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {state === 'idle' && (
          <div className="text-center">
            <div className="w-64 h-64 mx-auto mb-8 rounded-xl border-2 border-dashed border-ink-600 flex items-center justify-center bg-ink-800/50">
              <div className="text-center">
                <Camera size={48} className="text-ink-600 mx-auto mb-3" />
                <p className="text-ink-500 text-xs font-ui uppercase tracking-widest">Camera not started</p>
              </div>
            </div>
            <p className="text-ink-300 text-sm font-body mb-6 max-w-xs mx-auto leading-relaxed">
              Point your camera at an InkQuest QR sticker to unlock a tattoo design.
            </p>
            <button
              id="scanner-start-btn"
              onClick={startScanner}
              className="px-8 py-3 font-ui text-sm uppercase tracking-widest rounded bg-gold-500 text-ink-950 hover:bg-gold-400 transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}

        {(state === 'requesting' || state === 'scanning') && (
          <div className="w-full max-w-sm">
            {/* This element must remain mounted after permission is granted.
                Html5Qrcode attaches the video stream directly to it. */}
            <div id="qr-reader" className="rounded-xl overflow-hidden border border-ink-700 min-h-[280px] bg-ink-900" />
            {state === 'requesting' ? (
              <div className="mt-5 flex items-center justify-center gap-3 text-ink-300 font-ui uppercase tracking-widest text-sm">
                <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                Opening camera…
              </div>
            ) : (
              <>
                <p className="text-center text-ink-400 text-xs font-ui uppercase tracking-widest mt-4">Align the QR code in the frame</p>
                <button
                  id="scanner-stop-btn"
                  onClick={async () => { await stopScanner(); setState('idle'); }}
                  className="mt-4 w-full py-2 border border-ink-600 rounded text-ink-400 text-xs font-ui uppercase tracking-widest hover:border-ink-400 transition-colors"
                >
                  Stop camera
                </button>
              </>
            )}
          </div>
        )}

        {state === 'error' && (
          <div className="text-center max-w-xs mx-auto">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-sm font-body mb-6 leading-relaxed">{errorMsg}</p>
            <button
              id="scanner-retry-btn"
              onClick={startScanner}
              className="px-6 py-2 border border-gold-600 text-gold-500 rounded font-ui text-xs uppercase tracking-widest hover:bg-gold-600/10 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 text-center">
        <p className="text-ink-600 text-[10px] font-ui uppercase tracking-widest">Tip: look for gold stickers on walls, windows & lamp posts</p>
      </div>
    </div>
  );
}
