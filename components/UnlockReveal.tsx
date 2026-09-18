'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { Tattoo } from '@/types';
import { STUDIO_CONTACTS } from '@/lib/constants';

interface UnlockRevealProps {
  tattoo: Tattoo;
  isNew: boolean;
  onClose: () => void;
}

export function UnlockReveal({ tattoo, isNew, onClose }: UnlockRevealProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const whatsappMessage = encodeURIComponent(
    `Hi! I found the InkQuest QR code for "${tattoo.title}" and want to claim my ${tattoo.discount_percentage}% discount. 🖋️`
  );

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(7,7,7,0.95)' }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            id="unlock-close-btn"
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-ink-800 border border-ink-600 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-100 transition-colors"
            aria-label="Close reveal"
          >
            <X size={16} />
          </button>

          {/* Card flip scene */}
          <div
            className="cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => !isFlipped && setIsFlipped(true)}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Tattoo revealed' : 'Click to reveal your tattoo'}
            onKeyDown={(e) => e.key === 'Enter' && !isFlipped && setIsFlipped(true)}
          >
            <motion.div
              style={{
                transformStyle: 'preserve-3d',
                position: 'relative',
                width: '100%',
                aspectRatio: '3/4',
              }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* --- CARD FRONT (before flip) --- */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  position: 'absolute',
                  inset: 0,
                }}
              >
                <div
                  className="w-full h-full rounded-xl border-2 flex flex-col items-center justify-center p-8 gap-4"
                  style={{
                    borderColor: '#c9a84c',
                    background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.15) 0%, #0f0f0f 70%)',
                    boxShadow: '0 0 40px rgba(201,168,76,0.35), inset 0 0 60px rgba(0,0,0,0.5)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  >
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        border: '3px solid #c9a84c',
                        background: 'rgba(201,168,76,0.1)',
                        boxShadow: '0 0 30px rgba(201,168,76,0.35)',
                      }}
                    >
                      <span className="text-4xl">🖋️</span>
                    </div>
                  </motion.div>

                  <div className="text-center">
                    <p className="font-ui text-xs uppercase tracking-[0.3em] mb-1 text-gold-500">InkQuest Find</p>
                    <p className="font-display text-3xl text-ink-100 tracking-wider">
                      {isNew ? 'New Tattoo!' : 'Already Found'}
                    </p>
                  </div>

                  <motion.p
                    className="text-ink-400 text-sm font-ui text-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Tap to reveal
                  </motion.p>
                </div>
              </div>

              {/* --- CARD BACK (after flip) --- */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  position: 'absolute',
                  inset: 0,
                  transform: 'rotateY(180deg)',
                }}
              >
                <div
                  className="w-full h-full rounded-xl border-2 overflow-hidden flex flex-col"
                  style={{
                    borderColor: '#c9a84c',
                    boxShadow: '0 0 40px rgba(201,168,76,0.35)',
                  }}
                >
                  {/* Image */}
                  <div className="relative flex-1 bg-ink-800">
                    {tattoo.image_url ? (
                      <Image
                        src={tattoo.image_url}
                        alt={tattoo.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 400px) 100vw, 400px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-30">🖋️</span>
                      </div>
                    )}
                  </div>

                  {/* Info panel */}
                  <div className="bg-ink-900 p-4">
                    <h2 className="font-display text-2xl text-ink-50 tracking-widest mb-1">
                      {tattoo.title}
                    </h2>
                    {tattoo.description && (
                      <p className="text-ink-400 text-xs font-body mb-3 leading-relaxed">
                        {tattoo.description}
                      </p>
                    )}

                    {/* Discount badge */}
                    <div
                      className="flex items-center gap-3 p-3 rounded mb-3"
                      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
                    >
                      <span className="text-gold-500 text-2xl font-display tracking-wider">
                        {tattoo.discount_percentage}% OFF
                      </span>
                      <div>
                        <p className="text-ink-200 text-xs font-ui">Reward Unlocked!</p>
                        {tattoo.base_price && (
                          <p className="text-ink-400 text-[10px] font-ui">
                            Base: {tattoo.base_price.toLocaleString()} MKD
                          </p>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp booking button */}
                    <a
                      id="unlock-whatsapp-btn"
                      href={`${STUDIO_CONTACTS.student.whatsapp}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded font-ui text-sm uppercase tracking-widest transition-all"
                      style={{
                        background: '#25D366',
                        color: '#fff',
                      }}
                    >
                      <span>📱</span> Book via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hint text below card */}
          {!isFlipped && (
            <p className="text-center text-ink-500 text-xs font-ui mt-4 uppercase tracking-widest">
              Tap the card to reveal
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
