import { useEffect, useState } from 'react';

import { Session, User } from '@supabase/supabase-js';

import { GoogleIcon, Icon, LogoutIcon } from './components/icons';
import Loader from './components/loader';
import supabase from './lib/supabase';
import { cn } from './lib/utils';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(
      async (event, currentSession: Session | null) => {
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          await chrome.storage.local.set({ session: currentSession });
        }
        if (event == 'SIGNED_OUT') {
          await chrome.storage.local.set({ session: null });
        }
        const { session } = (await chrome.storage.local.get('session')) || {};
        setUser(session?.user);
      },
    );

    return () => {
      authListener?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      await chrome.storage.local.set({ session: null });
      setUser(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // redirectTo: chrome.identity.getRedirectURL(),
          redirectTo: import.meta.env.VITE_SITE_URL,
        },
      });
      if (error) throw error;
      await chrome.tabs.create({ url: data.url });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border mb-4 border-border relative mx-auto h-[230px] w-[360px] justify-center items-center grid gap-4 p-6 shadow-none duration-200">
      {user ? (
        <button
          title="Logout"
          onClick={async () => {
            await logout();
          }}
          className="absolute right-2 top-2 rounded-full active:bg-primary/10 p-2 text-primary/80 hover:bg-primary/20 transition-colors duration-200"
        >
          <LogoutIcon />
        </button>
      ) : null}
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="font-semibold leading-none tracking-normal items-center flex-col justify-center flex">
          <Icon />
        </h2>
        <h3 className="mt-1 mb-0 text-lg text-center font-medium text-primary">
          Bookmark It.
        </h3>
        {!user ? (
          <p className="mb-3 !mt-0.5 text-center text-sm font-normal text-muted-foreground">
            Welcome, Sign in below.
          </p>
        ) : null}
        {user ? (
          <div className="flex w-full text-base justify-center items-center">
            <img
              src={user?.user_metadata.avatar_url}
              className="w-7 h-7 mr-2 rounded-full"
              alt={user?.user_metadata.full_name}
            />
            {user?.user_metadata?.full_name}
          </div>
        ) : (
          <button
            onClick={() => {
              signInWithGoogle();
            }}
            className={cn(
              'items-center !mt-4 max-w-sm justify-center text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 hover:bg-primary/80 active:scale-[0.98] rounded-xl bg-primary px-16 py-4 text-secondary font-medium flex space-x-2 h-[40px] w-full',
              {
                'bg-primary/80 cursor-default': loading,
              },
            )}
          >
            {loading ? <Loader /> : <GoogleIcon />}
            Continue with Google
          </button>
        )}
      </div>
    </div>
  );
}
