import type { NextConfig } from 'next';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import withSerwistInit from '@serwist/next';

// This allows TypeScript to call `serwist`'s Augmentation.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dqpvwcsdswkklrzrccbf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Transpile leaflet / react-leaflet (they ship ES modules)
  transpilePackages: ['leaflet', 'react-leaflet'],
};

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist(nextConfig);
