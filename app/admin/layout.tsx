'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { LayoutDashboard, Image as ImageIcon, MapPin, LogOut } from 'lucide-react';
import { STUDIO_NAME } from '@/lib/constants';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/tattoos', icon: ImageIcon, label: 'Tattoos' },
  { href: '/admin/locations', icon: MapPin, label: 'Locations' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthorized(false);
        router.push('/profile'); // Redirect to login
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.push('/'); // Not an admin
      }
    }

    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-ink-950">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-dvh bg-ink-950">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-900 border-r border-ink-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-ink-800 text-center">
          <h1 className="font-display text-2xl text-gold-500 tracking-widest">{STUDIO_NAME}</h1>
          <p className="text-ink-400 text-[10px] font-ui uppercase tracking-widest">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded font-ui tracking-wider transition-colors ${
                  isActive
                    ? 'bg-ink-800 text-gold-500 border-l-2 border-gold-500'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-800">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-ink-500 hover:text-ink-300 font-ui tracking-wider rounded hover:bg-ink-800 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-dvh overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-ink-900 border-b border-ink-800 p-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-gold-500 tracking-widest">{STUDIO_NAME}</h1>
            <p className="text-ink-400 text-[9px] font-ui uppercase tracking-widest">Admin Portal</p>
          </div>
          {/* Simple mobile nav for now */}
          <nav className="flex gap-4">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`text-ink-300 hover:text-gold-500 ${pathname === item.href ? 'text-gold-500' : ''}`}>
                <item.icon size={20} />
              </Link>
            ))}
          </nav>
        </header>

        <div className="flex-1 p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
