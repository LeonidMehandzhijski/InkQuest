# InkQuest

**InkQuest** is a location-based tattoo discovery game created for **Tattoo Skin Art**. Players explore the city map, follow hints to physical QR codes, and unlock collectible tattoo designs—and their associated discounts—when they scan at the right location.

Built as a mobile-first progressive web app, InkQuest turns a tattoo studio's local campaign into an interactive treasure hunt.

## What players can do

- Browse active tattoo locations on an interactive Leaflet map.
- Use the built-in QR scanner to discover designs in the real world.
- Unlock designs only when physically close to a QR location, protected by server-side geofencing.
- Build an **Inkfolio** of found tattoos and track collection progress.
- Play as a guest, then sign in to preserve and sync a collection.
- Contact the studio through WhatsApp to book a discovered design.

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

## Local development

### Prerequisites

- Node.js 20+
- A Supabase project

### Install and configure

```bash
npm install
cp .env.example .env.local
```

Create `.env.local` with your Supabase credentials and app URL:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Keep `SUPABASE_SERVICE_ROLE_KEY` private. It is used only by server-side routes and must never be exposed to the browser.

### Set up Supabase

Run the SQL files in the Supabase SQL Editor, in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_bucket.sql`
4. `supabase/migrations/004_remove_tattoo_rarity.sql` (existing projects only)

Optionally load placeholder tattoos and locations:

```bash
npx tsx supabase/seed.ts
```

### Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The consumer experience starts on the map; the admin portal is available at `/admin` for users whose `public.users.role` is `admin`.

## QR validation

Each location has a unique UUID embedded in its QR code. When a player scans it, the server:

1. Finds the active location tied to that UUID.
2. Calculates the player's distance using the Haversine formula.
3. Accepts the scan only within the configured geofence (150 m by default).
4. Records one valid scan per user or guest per location.

Campaign settings such as the map center and geofence radius live in `lib/constants.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run linting |

## Deployment

Deploy to Vercel or another Next.js-compatible host. Configure these production environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

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

This project is currently private and intended for Tattoo Skin Art. Add a license before redistributing or accepting outside contributions.
