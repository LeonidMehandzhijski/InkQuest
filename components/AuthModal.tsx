'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useStore } from '@/hooks/useStore';
import { getGuestId, clearGuestId } from '@/lib/guestId';
import { STUDIO_NAME } from '@/lib/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthState = 'idle' | 'loading' | 'success' | 'error';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [state, setState] = useState<AuthState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { setUser, setGuestId } = useStore();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setState('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setState('error');
    } else {
      setStep('otp');
      setState('idle');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setState('loading');
    setErrorMsg('');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setErrorMsg(error.message);
      setState('error');
    } else if (data.user) {
      // Login successful!
      // 1. Sync guest data to the new user if they had any guest scans
      const guestId = getGuestId();
      if (guestId) {
        try {
          await fetch('/api/sync-guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guest_id: guestId }),
          });
          // Clear local guest ID so we don't try to sync again
          clearGuestId();
          setGuestId(null);
        } catch (syncErr) {
          console.error('Failed to sync guest data:', syncErr);
          // Non-blocking error, user is still logged in
        }
      }

      // 2. Fetch full user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at,
        });
      }

      setState('success');
      setTimeout(() => {
        onClose();
        // Reset modal state
        setTimeout(() => {
          setStep('email');
          setState('idle');
          setEmail('');
          setOtp('');
        }, 500);
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink-950/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-sm bg-ink-900 border border-ink-700 rounded-xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-ink-800 bg-ink-950">
              <h2 className="font-display text-xl text-gold-500 tracking-widest">{STUDIO_NAME}</h2>
              <button
                onClick={onClose}
                className="p-1 text-ink-500 hover:text-ink-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {state === 'success' ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                  <p className="font-display text-2xl text-ink-100 tracking-widest mb-2">Welcome In</p>
                  <p className="text-ink-400 font-ui text-sm uppercase tracking-widest">You are now logged in.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="font-display text-2xl text-ink-100 tracking-widest mb-1">
                      {step === 'email' ? 'Save Your Progress' : 'Verify Email'}
                    </p>
                    <p className="text-ink-400 font-ui text-[10px] uppercase tracking-widest">
                      {step === 'email' 
                        ? 'Create an account to keep your discovered tattoos.' 
                        : `We sent a code to ${email}`}
                    </p>
                  </div>

                  {state === 'error' && (
                    <div className="flex items-start gap-2 p-3 mb-4 rounded bg-red-950/30 border border-red-900">
                      <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-red-400 text-xs font-ui leading-tight">{errorMsg}</p>
                    </div>
                  )}

                  {step === 'email' ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                          <input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-ink-950 border border-ink-700 rounded py-3 pl-10 pr-4 text-sm font-ui text-ink-100 placeholder:text-ink-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                            disabled={state === 'loading'}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={state === 'loading' || !email}
                        className="w-full flex items-center justify-center py-3 bg-gold-600 hover:bg-gold-500 text-ink-950 font-ui text-sm uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {state === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Send Login Code'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-ink-950 border border-ink-700 rounded py-3 px-4 text-center text-xl font-body tracking-widest text-ink-100 placeholder:text-ink-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                          disabled={state === 'loading'}
                          autoFocus
                          maxLength={6}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={state === 'loading' || otp.length < 6}
                        className="w-full flex items-center justify-center py-3 bg-gold-600 hover:bg-gold-500 text-ink-950 font-ui text-sm uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {state === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Login'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setStep('email'); setState('idle'); setOtp(''); }}
                        className="w-full text-center py-2 text-ink-500 hover:text-ink-300 font-ui text-[10px] uppercase tracking-widest transition-colors"
                        disabled={state === 'loading'}
                      >
                        Use a different email
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
