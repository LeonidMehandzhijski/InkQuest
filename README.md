# InkQuest

**InkQuest** is a location-based tattoo discovery game created for [Tattoo Skin Art](https://www.instagram.com/tattooskinartstudio/). Players explore the city map, follow hints to physical QR codes, and unlock collectible tattoo designs and their associated discounts when they scan the QR codes.

Built as a mobile first web app, InkQuest turns a tattoo studio's local campaign into an interactive treasure hunt.

## What players can do

- Browse active tattoo locations on an interactive Leaflet map.
- Use the built-in QR scanner (or their phones) to discover designs in the real world.
- Unlock designs only when physically close to a QR location, protected by server-side geofencing.
- Build an **Inkfolio** of found tattoos and track collection progress.
- Play as a guest, then sign in to preserve and sync a collection.
- Contact the studio through WhatsApp/Instagram/Viber to book a discovered design.

## What admins can do

- View campaign statistics and recent booking activity.
- Create, edit, and manage tattoo designs.
- Create locations, attach a design, and issue its unique QR link.
- Control whether tattoos and locations are active.

## Tech stack

- [Next.js](https://nextjs.org/) 16 and React 19
- TypeScript and Tailwind CSS
- [Supabase](https://supabase.com/) for authentication, PostgreSQL data, and image storage
- Leaflet / React Leaflet for the map
- `html5-qrcode` for QR scanning
- Zustand for client state
- Serwist for PWA and offline support

## QR validation

Each location has a unique UUID embedded in its QR code. When a player scans it, the server:

1. Finds the active location tied to that UUID.
2. Calculates the player's distance using the Haversine formula.
3. Accepts the scan only within the configured geofence (150 m by default).
4. Records one valid scan per user or guest per location.

Campaign settings such as the map center and geofence radius live in `lib/constants.ts`.

## Project structure

```text
app/                    Next.js routes, screens, API endpoints, and PWA manifest
components/             Map, scanner, authentication, cards, and reveal UI
supabase/migrations/    Database schema, row-level security, and storage setup
lib/                    Supabase clients, geofencing, campaign constants
hooks/                  Client-side state management
types/                  Shared TypeScript models
```

## License

This project is currently private and intended for Tattoo Skin Art.
