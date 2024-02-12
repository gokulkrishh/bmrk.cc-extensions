import { Session, createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL ?? '',
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
    {
      auth: {
        storage: {
          async getItem(key: string): Promise<string | null> {
            const storage = await chrome.storage.local.get(key);
            return storage?.[key];
          },
          async setItem(key: string, value: string): Promise<void> {
            await chrome.storage.local.set({
              [key]: JSON.parse(value),
            });
          },
          async removeItem(key: string): Promise<void> {
            await chrome.storage.local.remove(key);
          },
        },
      },
    },
  );
}

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
