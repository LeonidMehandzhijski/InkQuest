require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('locations').select('*, tattoo:tattoos(*)').then(({ data, error }) => {
  console.log('Data:', data);
  console.log('Error:', error);
}).catch(console.error);
