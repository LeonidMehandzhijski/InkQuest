'use client';

import { useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useStore } from '@/hooks/useStore';
import type { User } from '@/types';

async function loadProfile(authUser: SupabaseUser): Promise<User | null> {
  let { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load InkQuest profile:', error);
    return null;
  }

  if (!profile) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({ id: authUser.id, email: authUser.email });

    // A database trigger may have created the row just before this insert.
    if (insertError && insertError.code !== '23505') {
      console.error('Failed to create InkQuest profile:', insertError);
      return null;
    }

    const result = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    profile = result.data;
    error = result.error;
  }

  if (error || !profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    guest_id: profile.guest_id,
    role: profile.role,
    created_at: profile.created_at,
  };
}

export function AuthSessionSync() {
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    let active = true;

    const sync = async (authUser: SupabaseUser | null) => {
      if (!authUser) {
        if (active) setUser(null);
        return;
      }

      const profile = await loadProfile(authUser);
      if (active && profile) setUser(profile);
    };

    void supabase.auth.getUser().then(({ data }) => sync(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void sync(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser]);

  return null;
}
