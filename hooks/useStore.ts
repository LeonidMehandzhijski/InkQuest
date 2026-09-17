'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Tattoo, User } from '@/types';

interface InkQuestState {
  // Auth
  user: User | null;
  guestId: string | null;

  // Collection: IDs of location_ids that have been scanned
  collectedLocationIds: string[];

  // Unlock reveal animation state
  pendingUnlock: {
    tattoo: Tattoo;
    locationId: string;
    isNew: boolean;
  } | null;

  // Actions
  setUser: (user: User | null) => void;
  setGuestId: (id: string | null) => void;
  addCollectedLocation: (locationId: string) => void;
  setCollectedLocations: (ids: string[]) => void;
  setPendingUnlock: (unlock: InkQuestState['pendingUnlock']) => void;
  clearPendingUnlock: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  guestId: null,
  collectedLocationIds: [],
  pendingUnlock: null,
};

export const useStore = create<InkQuestState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setGuestId: (guestId) => set({ guestId }),

      addCollectedLocation: (locationId) =>
        set((state) => ({
          collectedLocationIds: state.collectedLocationIds.includes(locationId)
            ? state.collectedLocationIds
            : [...state.collectedLocationIds, locationId],
        })),

      setCollectedLocations: (ids) => set({ collectedLocationIds: ids }),

      setPendingUnlock: (pendingUnlock) => set({ pendingUnlock }),

      clearPendingUnlock: () => set({ pendingUnlock: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'inkquest-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        guestId: state.guestId,
        collectedLocationIds: state.collectedLocationIds,
      }),
    }
  )
);
