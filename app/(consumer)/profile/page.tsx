'use client';

import { useState } from 'react';
import { User as UserIcon, LogOut, Settings, Award } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { AuthModal } from '@/components/AuthModal';
import { supabase } from '@/lib/supabaseClient';
import { STUDIO_NAME } from '@/lib/constants';
import { clearGuestId } from '@/lib/guestId';

export default function ProfilePage() {
  const { user, setUser, setGuestId, collectedLocationIds } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    clearGuestId();
    setGuestId(null);
    // Note: collectedLocationIds will remain in local state to allow a fresh start, 
    // or they could be cleared depending on desired UX.
  };

  return (
    <div className="flex flex-col min-h-full bg-ink-950 pt-safe px-4 pb-6">
      <div className="py-6 text-center border-b border-ink-800 mb-6">
        <h1 className="font-display text-3xl text-gold-500 tracking-widest mb-1">PROFILE</h1>
        <p className="text-ink-400 text-xs font-ui uppercase tracking-widest">
          {user ? 'Your Account' : 'Guest Mode'}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* User Card */}
        <div className="bg-ink-900 border border-ink-800 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <UserIcon size={120} />
          </div>
          
          <div className="w-20 h-20 bg-ink-950 border-2 border-gold-500 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-[0_0_20px_rgba(201,168,76,0.3)]">
            <UserIcon size={32} className="text-gold-500" />
          </div>
          
          <h2 className="font-display text-2xl text-ink-100 tracking-widest relative z-10">
            {user ? user.email?.split('@')[0] : 'Wandering Soul'}
          </h2>
          <p className="text-ink-400 font-ui text-sm relative z-10">
            {user ? user.email : 'Sign in to save your progress permanently.'}
          </p>

          {!user && (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="mt-6 px-8 py-3 bg-gold-600 hover:bg-gold-500 text-ink-950 font-ui text-sm uppercase tracking-widest rounded transition-colors relative z-10"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-ink-900 border border-ink-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Award size={24} className="text-gold-500 mb-2" />
            <span className="font-display text-3xl text-ink-100">{collectedLocationIds.length}</span>
            <span className="text-ink-400 font-ui text-[10px] uppercase tracking-widest">Tattoos Found</span>
          </div>
          <div className="bg-ink-900 border border-ink-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Settings size={24} className="text-ink-500 mb-2" />
            <span className="font-display text-xl text-ink-100 leading-tight">Settings</span>
            <span className="text-ink-400 font-ui text-[10px] uppercase tracking-widest">Coming Soon</span>
          </div>
        </div>

        <div className="mt-auto pt-6">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 bg-ink-900 border border-ink-800 text-ink-400 hover:text-ink-200 hover:bg-ink-800 font-ui text-sm uppercase tracking-widest rounded transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <p className="text-center text-ink-600 font-ui text-[10px] uppercase tracking-widest">
              {STUDIO_NAME}
            </p>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
