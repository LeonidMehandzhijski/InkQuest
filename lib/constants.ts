// ============================================================
// InkQuest - Application Constants
// Edit this file to tweak game parameters without touching logic.
// ============================================================

/** 
 * GEOFENCING: Maximum distance (in metres) the user can be from a 
 * QR sticker location to have their scan accepted.
 * 
 * Recommended: 150m. Increase to 250-300m if GPS drift is a problem
 * in the target area (urban canyons between tall buildings, etc.)
 */
export const GEOFENCE_RADIUS_METERS = 150;

/**
 * The visual radius (in metres) shown as a "Search Zone" circle on the map.
 * Slightly larger than the geofence to give users a hint without being exact.
 */
export const MAP_SEARCH_ZONE_RADIUS_METERS = 200;

/** Default map center: Skopje city centre */
export const MAP_DEFAULT_CENTER: [number, number] = [41.9981, 21.4254];
export const MAP_DEFAULT_ZOOM = 14;

/** Studio contact info for WhatsApp booking deep-links */
export const STUDIO_CONTACTS = {
  master: {
    name: 'Master Tattooist',
    phone: '38970967885', // no leading +
    whatsapp: 'https://wa.me/38970967885',
  },
  student: {
    name: 'Tattoo Artist (Student)',
    phone: '38970292491',
    whatsapp: 'https://wa.me/38970292491',
  },
  piercing: {
    name: 'Piercing Artist',
    phone: '38970445325',
    whatsapp: 'https://wa.me/38970445325',
  },
} as const;

/** Studio info */
export const STUDIO_NAME = 'Tattoo Skin Art';
export const STUDIO_TAGLINE = 'Ink your story. Find your art.';

/** Rarity colours (for UI badges and glows) */
export const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: '#9ca3af',       // gray-400
    glow: 'rgba(156,163,175,0.4)',
    bg: 'rgba(156,163,175,0.1)',
  },
  rare: {
    label: 'Rare',
    color: '#60a5fa',       // blue-400
    glow: 'rgba(96,165,250,0.4)',
    bg: 'rgba(96,165,250,0.1)',
  },
  epic: {
    label: 'Epic',
    color: '#c084fc',       // purple-400
    glow: 'rgba(192,132,252,0.5)',
    bg: 'rgba(192,132,252,0.15)',
  },
} as const;

/** Gold accent colour used throughout the UI */
export const GOLD = '#c9a84c';
