'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, Mail, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { STUDIO_NAME } from '@/lib/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthState = 'idle' | 'loading' | 'error';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [state, setState] = useState<AuthState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const resetAndClose = () => {
    onClose();
    window.setTimeout(() => {
      setStep('email');
      setState('idle');
      setErrorMsg('');
      setEmail('');
    }, 250);
  };

  const sendSignInLink = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!email) return;

    setState('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + '/auth/callback',
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setState('error');
      return;
    }

    setStep('sent');
    setState('idle');
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
            <div className="flex items-center justify-between p-4 border-b border-ink-800 bg-ink-950">
              <h2 className="font-display text-xl text-gold-500 tracking-widest">{STUDIO_NAME}</h2>
              <button
                type="button"
                onClick={resetAndClose}
                className="p-1 text-ink-500 hover:text-ink-200 transition-colors"
                aria-label="Close sign in"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {state === 'error' && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded bg-red-950/30 border border-red-900">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs font-ui leading-tight">{errorMsg}</p>
                </div>
              )}

              {step === 'email' ? (
                <>
                  <div className="text-center mb-6">
                    <p className="font-display text-2xl text-ink-100 tracking-widest mb-1">Save Your Progress</p>
                    <p className="text-ink-400 font-ui text-[10px] uppercase tracking-widest">
                      Sign in to keep your discovered tattoos.
                    </p>
                  </div>

                  <form onSubmit={sendSignInLink} className="space-y-4">
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
                    <button
                      type="submit"
                      disabled={state === 'loading' || !email}
                      className="w-full flex items-center justify-center py-3 bg-gold-600 hover:bg-gold-500 text-ink-950 font-ui text-sm uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Email me a sign-in link'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-3">
                  <CheckCircle2 size={48} className="text-gold-500 mx-auto mb-4" />
                  <p className="font-display text-2xl text-ink-100 tracking-widest mb-2">Check Your Inbox</p>
                  <p className="text-ink-300 font-body text-sm leading-relaxed">
                    We sent a confirmation link to <span className="text-gold-500">{email}</span>.
                    Open it on this device to sign in and save your InkFolio.
                  </p>
                  <button
                    type="button"
                    onClick={() => void sendSignInLink()}
                    disabled={state === 'loading'}
                    className="mt-6 w-full flex items-center justify-center py-3 border border-gold-600 text-gold-500 hover:bg-gold-600/10 font-ui text-xs uppercase tracking-widest rounded transition-colors disabled:opacity-50"
                  >
                    {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Resend link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setState('idle'); setErrorMsg(''); }}
                    className="mt-3 w-full text-ink-500 hover:text-ink-300 font-ui text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
