import { createClient } from '@supabase/supabase-js';
import { User } from 'types/data';

function createSupabaseClient() {
  return createClient(import.meta.env.VITE_SUPABASE_URL ?? '', import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');
}

export const getUser = async () => {
  try {
    const { session } = (await chrome.storage.local.get('session')) || {};
    return session?.user as User | undefined;
  } catch {
    return undefined;
  }
};

export default createSupabaseClient();
