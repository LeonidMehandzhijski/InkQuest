'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route Error Boundary caught an error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-6 text-center bg-ink-950">
      <AlertCircle size={48} className="text-gold-500 mb-6" />
      <h2 className="font-display text-2xl text-ink-100 tracking-widest mb-4">Oops!</h2>
      <p className="text-ink-400 font-body text-sm mb-8 max-w-xs leading-relaxed">
        We encountered a problem loading this section.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-transparent border border-gold-600 text-gold-500 hover:bg-gold-600 hover:text-ink-950 font-ui text-sm uppercase tracking-widest rounded transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
