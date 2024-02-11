import { createClient } from '@supabase/supabase-js';
import { User } from 'types/data';

function createSupabaseClient() {
  return createClient(import.meta.env.VITE_SUPABASE_URL ?? '', import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');
}

export const setSession = async () => {
  try {
    const supabase = createSupabaseClient();
    const { session } = (await chrome.storage.local.get('session')) || {};
    const { error } = await supabase.auth.setSession(session);
    if (error) {
      throw error;
    }
    return session?.user as User | undefined;
  } catch {
    return undefined;
  }
};

export const getUser = async () => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    const { session } = data;
    if (error || !session) {
      throw new Error('Error getting user');
    }
    return session?.user;
  } catch {
    throw new Error('Error getting user');
  }
};

export default createSupabaseClient();
