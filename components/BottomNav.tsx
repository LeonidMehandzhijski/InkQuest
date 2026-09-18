'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ChevronDown, ChevronUp, Grid2x2, Map, User } from 'lucide-react';

const tabs = [
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/scan', icon: Camera, label: 'Scan' },
  { href: '/collection', icon: Grid2x2, label: 'InkFolio' },
  { href: '/profile', icon: User, label: 'Profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const isMap = pathname === '/map';
  const [isExpanded, setIsExpanded] = useState(!isMap);

  useEffect(() => {
    setIsExpanded(!isMap);
  }, [isMap]);

  if (isMap && !isExpanded) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-[1100] pointer-events-none" aria-label="Main navigation">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-ink-900/95 border border-gold-600 text-gold-500 shadow-[0_0_18px_rgba(0,0,0,0.55)] flex items-center justify-center hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label="Open navigation"
          aria-expanded="false"
        >
          <ChevronUp size={25} />
        </button>
      </nav>
    );
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1100] bg-ink-900/95 backdrop-blur border-t border-ink-700 pb-safe"
      aria-label="Main navigation"
    >
      {isMap && (
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-ink-900 border border-gold-600 text-gold-500 flex items-center justify-center shadow-[0_-3px_12px_rgba(0,0,0,0.45)] hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label="Hide navigation"
          aria-expanded="true"
        >
          <ChevronDown size={22} />
        </button>
      )}
      <div className="flex items-stretch h-16">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href.length > 1 && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={
                'flex-1 flex flex-col items-center justify-center gap-1 text-xs font-ui transition-colors duration-150 ' +
                (isActive ? 'text-gold-500' : 'text-ink-400 hover:text-ink-200')
              }
              aria-current={isActive ? 'page' : undefined}
              id={'nav-' + label.toLowerCase()}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={isActive ? 'drop-shadow-[0_0_6px_rgba(201,168,76,0.7)]' : ''}
              />
              <span className="font-ui text-[10px] uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
