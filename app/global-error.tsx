'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service here if needed
    console.error('Global Error Boundary caught an error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-ink-950 text-ink-100 flex flex-col items-center justify-center min-h-dvh p-6 text-center">
        <AlertTriangle size={64} className="text-red-500 mb-6" />
        <h1 className="font-display text-3xl text-ink-100 tracking-widest mb-4">Something went wrong!</h1>
        <p className="text-ink-400 font-body text-sm max-w-md mb-8 leading-relaxed">
          A critical error occurred. Please try refreshing the app. If the problem persists, contact the studio.
        </p>
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-gold-600 hover:bg-gold-500 text-ink-950 font-ui text-sm uppercase tracking-widest rounded transition-colors"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
