'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Camera, Grid2x2, User } from 'lucide-react';

const tabs = [
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/scan', icon: Camera, label: 'Scan' },
  { href: '/collection', icon: Grid2x2, label: 'InkFolio' },
  { href: '/profile', icon: User, label: 'Profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-ink-900 border-t border-ink-700 pb-safe"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch h-16">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href.length > 1 && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 text-xs font-ui
                transition-colors duration-150
                ${isActive
                  ? 'text-gold-500'
                  : 'text-ink-400 hover:text-ink-200'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              id={`nav-${label.toLowerCase()}`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={isActive ? 'drop-shadow-[0_0_6px_rgba(201,168,76,0.7)]' : ''}
              />
              <span className="font-ui text-[10px] uppercase tracking-widest">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
