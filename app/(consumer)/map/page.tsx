import type { Metadata } from 'next';
import { MapPageClient } from './client';

export const metadata: Metadata = {
  title: 'Map',
};

export default function MapPage() {
  return <MapPageClient />;
}
