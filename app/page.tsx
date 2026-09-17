import Link from 'next/link';
import { ArrowRight, MapPin, Scan, Sparkles } from 'lucide-react';
import { STUDIO_NAME } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-ink-950 text-ink-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-gold-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-safe">
        
        {/* Top Logo / Studio Name */}
        <div className="mb-12 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-ink-400 font-ui text-xs uppercase tracking-[0.3em] mb-2">Presented by</p>
          <h2 className="font-display text-2xl text-ink-100 tracking-[0.2em]">{STUDIO_NAME}</h2>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-md mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-display text-6xl md:text-7xl text-gold-500 tracking-widest mb-6 drop-shadow-[0_0_15px_rgba(201,168,76,0.3)]">
            INKQUEST
          </h1>
          <p className="text-ink-300 font-body text-lg leading-relaxed px-4">
            A real-world scavenger hunt for exclusive tattoos. Find the gold QR stickers hidden around Skopje to unlock unique designs and claim your rewards.
          </p>
        </div>

        {/* Features / How it works */}
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-ink-900/50 border border-ink-800 backdrop-blur-sm">
            <div className="mt-1 p-2 bg-ink-950 rounded-full text-gold-500 border border-ink-800">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-display tracking-widest text-lg mb-1">Hunt</h3>
              <p className="text-ink-400 font-body text-sm">Check the map for active search zones around the city.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-xl bg-ink-900/50 border border-ink-800 backdrop-blur-sm">
            <div className="mt-1 p-2 bg-ink-950 rounded-full text-gold-500 border border-ink-800">
              <Scan size={20} />
            </div>
            <div>
              <h3 className="font-display tracking-widest text-lg mb-1">Scan</h3>
              <p className="text-ink-400 font-body text-sm">Find the golden QR stickers in the real world and scan them.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-ink-900/50 border border-ink-800 backdrop-blur-sm">
            <div className="mt-1 p-2 bg-ink-950 rounded-full text-gold-500 border border-ink-800">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-display tracking-widest text-lg mb-1">Unlock</h3>
              <p className="text-ink-400 font-body text-sm">Reveal exclusive tattoo designs and secure built-in discounts.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/map"
            className="group relative w-full flex items-center justify-center gap-3 py-4 bg-gold-600 text-ink-950 font-ui text-sm uppercase tracking-[0.2em] rounded overflow-hidden transition-all hover:bg-gold-500 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)]"
          >
            <span>Start Exploring</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-center text-ink-500 font-ui text-[10px] uppercase tracking-widest mt-6">
            Completely free to play
          </p>
        </div>
        
      </main>
    </div>
  );
}
