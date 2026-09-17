import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Seeding Supabase database with PLACEHOLDER data...');

  // --- Seed Tattoos ---
  console.log('Inserting Tattoos...');
  const tattoosData = [
    {
      title: 'Traditional Panther',
      description: 'Classic American traditional panther head.',
      rarity: 'common',
      discount_percentage: 10,
      base_price: 3500,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&q=80',
    },
    {
      title: 'Neo-Trad Rose',
      description: 'Bold lines and vibrant colors on this neo-traditional rose.',
      rarity: 'rare',
      discount_percentage: 20,
      base_price: 4500,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80',
    },
    {
      title: 'Japanese Dragon Sleeve',
      description: 'Epic Japanese style dragon.',
      rarity: 'epic',
      discount_percentage: 35,
      base_price: 15000,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1621285853634-713b8dd792a0?w=800&q=80',
    }
  ];

  const { data: insertedTattoos, error: tattoosError } = await supabase
    .from('tattoos')
    .insert(tattoosData)
    .select();

  if (tattoosError) {
    console.error('Error inserting tattoos:', tattoosError);
    process.exit(1);
  }

  // --- Seed Locations (in Skopje) ---
  console.log('Inserting Locations...');
  const locationsData = [
    {
      tattoo_id: insertedTattoos[0].id,
      lat: 41.9965,
      lng: 21.4314, // Macedonia Square
      hint_text: 'Look near the warrior on a horse statue.',
      is_active: true,
    },
    {
      tattoo_id: insertedTattoos[1].id,
      lat: 42.0005,
      lng: 21.4239, // City Park
      hint_text: 'Hidden behind a large oak tree near the pond.',
      is_active: true,
    },
    {
      tattoo_id: insertedTattoos[2].id,
      lat: 41.9990,
      lng: 21.4370, // Old Bazaar
      hint_text: 'Wander the narrow cobblestone streets, near a silver shop.',
      is_active: true,
    }
  ];

  const { error: locationsError } = await supabase
    .from('locations')
    .insert(locationsData);

  if (locationsError) {
    console.error('Error inserting locations:', locationsError);
    process.exit(1);
  }

  // --- Seed Admin User (Optional, if auth user exists) ---
  // You would typically sign up in the UI, then set your role to 'admin' in the dashboard.
  
  console.log('Seed completed successfully!');
  console.log('IMPORTANT: These are placeholders. You can delete them later via the Admin Dashboard.');
}

main().catch(console.error);
