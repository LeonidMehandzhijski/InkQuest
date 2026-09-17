'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, AlertCircle, Flashlight } from 'lucide-react';

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'error';

export function ScannerView() {
  const router = useRouter();
  const [state, setState] = useState<ScannerState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<{ stop: () => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    setState('requesting');

    try {
      // Dynamically import html5-qrcode (browser only)
      const { Html5Qrcode } = await import('html5-qrcode');

      setState('scanning');

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Rear camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          // Extract qr_uuid from URL like: https://domain/scan/UUID
          const match = decodedText.match(/\/scan\/([0-9a-f-]{36})/i);
          if (match) {
            scanner.stop();
            router.push(`/scan/${match[1]}`);
          } else {
            // Not an InkQuest QR — ignore and keep scanning
          }
        },
        () => {
          // QR not found in frame — this fires constantly, ignore it
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setErrorMsg('Camera access denied. Please allow camera access in your browser settings and reload.');
      } else {
        setErrorMsg(`Camera error: ${msg}`);
      }
      setState('error');
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-ink-950 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h1 className="font-display text-2xl text-gold-500 tracking-widest">SCAN</h1>
          <p className="text-ink-400 text-xs font-ui uppercase tracking-widest">Find a QR sticker</p>
        </div>
        <Camera size={28} className="text-ink-600" />
      </div>

      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {state === 'idle' && (
          <div className="text-center">
            {/* Viewfinder placeholder */}
            <div
              className="w-64 h-64 mx-auto mb-8 rounded-xl border-2 border-dashed border-ink-600 flex items-center justify-center"
              style={{ background: 'rgba(26,26,26,0.5)' }}
            >
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
              className="px-8 py-3 font-ui text-sm uppercase tracking-widest rounded transition-all"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #d4a843)',
                color: '#0a0a0a',
              }}
            >
              Start Camera
            </button>
          </div>
        )}

        {state === 'requesting' && (
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-ink-300 font-ui uppercase tracking-widest text-sm">Starting camera…</p>
          </div>
        )}

        {state === 'scanning' && (
          <div className="w-full max-w-sm">
            {/* html5-qrcode renders into this div */}
            <div
              id="qr-reader"
              ref={containerRef}
              className="rounded-xl overflow-hidden border border-ink-700"
              style={{ minHeight: '280px' }}
            />
            <p className="text-center text-ink-400 text-xs font-ui uppercase tracking-widest mt-4">
              Align the QR code in the frame
            </p>
            <button
              id="scanner-stop-btn"
              onClick={() => {
                if (scannerRef.current) {
                  scannerRef.current.stop();
                }
                setState('idle');
              }}
              className="mt-4 w-full py-2 border border-ink-600 rounded text-ink-400 text-xs font-ui uppercase tracking-widest hover:border-ink-400 transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center max-w-xs mx-auto">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-sm font-body mb-6 leading-relaxed">{errorMsg}</p>
            <button
              id="scanner-retry-btn"
              onClick={() => { setErrorMsg(''); setState('idle'); }}
              className="px-6 py-2 border border-gold-600 text-gold-500 rounded font-ui text-xs uppercase tracking-widest hover:bg-gold-600/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="px-4 pb-6 text-center">
        <p className="text-ink-600 text-[10px] font-ui uppercase tracking-widest">
          Tip: look for gold stickers on walls, windows & lamp posts
        </p>
      </div>
    </div>
  );
}
