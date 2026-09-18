# InkQuest Setup Instructions

## 1. Supabase Initialization
Your `.env.local` is already configured with your Supabase credentials. 

To initialize the database, execute the SQL files in the `supabase/migrations/` folder in your Supabase SQL Editor in this order:
1. `001_initial_schema.sql` (Creates tables)
2. `002_rls_policies.sql` (Applies security policies)
3. `003_storage_bucket.sql` (Creates public storage bucket for tattoo images)

## 2. Running Locally
Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 3. Seed Data (Optional)
To populate the database with placeholder tattoos and locations for testing:
```bash
npx tsx supabase/seed.ts
```
*Note: Make sure to delete this placeholder data from the Admin Dashboard once you're ready to go live.*

## 4. Admin Access
1. Sign in to the app via the "Profile" page.
2. Go to the [Supabase Dashboard](https://supabase.com/dashboard/project/dqpvwcsdswkklrzrccbf) > Table Editor > `users` table.
3. Find your user record and change the `role` column to `admin`.
4. You can now access the Admin portal by visiting `/admin` or navigating via the URL directly.

## 5. Email sign-in configuration
InkQuest uses Supabase email confirmation links to sign users in and preserve their collections.

1. In Supabase, open **Authentication → URL Configuration**.
2. Set **Site URL** to your production URL (for example, `https://your-app.vercel.app`), not `http://localhost:3000`.
3. Add both `https://your-app.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` to **Redirect URLs**.
4. Keep Supabase's default **Confirm signup** and **Magic Link** email templates, which contain `{{ .ConfirmationURL }}`.

A mismatched Site URL or missing Redirect URL causes email links to open localhost. Custom email templates require custom SMTP in Supabase and are not needed for the default InkQuest sign-in flow.

## 6. Deployment
When deploying to Vercel, ensure you set the following Environment Variables in the Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (Set this to your production domain, e.g., `https://inkquest.vercel.app`)
