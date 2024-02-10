import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL ?? '',
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  );
}

export default createSupabaseClient();
