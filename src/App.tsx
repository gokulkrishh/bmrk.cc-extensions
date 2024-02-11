import { useEffect, useState } from 'react';

import { Session, User } from '@supabase/supabase-js';

import { GoogleIcon, Icon } from 'components/icons';
import Loader from 'components/loader';
import supabase from 'lib/supabase';
import { cn } from 'lib/utils';
import { ThemeProvider } from 'components/context/theme-context';
import { Toaster } from 'components/ui/sonner';
import Profile from 'components/profile';
import Bookmarks from 'components/bookmarks';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (event, currentSession: Session | null) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        await chrome.storage.local.set({ session: currentSession });
      }
      if (event == 'SIGNED_OUT') {
        await chrome.storage.local.set({ session: null });
      }
      const { session } = (await chrome.storage.local.get('session')) || {};
      setUser(session?.user);
      setLoading(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDone = () => {
    try {
      setLoading(true);
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
          redirectTo: chrome.identity.getRedirectURL(),
          // redirectTo: import.meta.env.VITE_SITE_URL,
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
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="mb-4 relative mx-auto min-h-[225px] max-h-full h-full w-[360px] shadow-none duration-200">
          {user ? (
            <>
              <div className="flex w-full border-b border-input justify-between">
                <div className="flex items-center shrink-0">
                  <h2 className="text-base shrink-0 mt-1 mb-1 ml-2 text-center font-medium text-primary mr-2 leading-none tracking-normal items-center justify-center flex">
                    <Icon className="w-9 h-9 mr-1.5" />
                    <span>Bookmark It.</span>
                  </h2>
                </div>
                <Profile user={user} onDone={onDone} />
              </div>
              <Bookmarks />
            </>
          ) : null}
          {!user && !loading ? (
            <div className="flex h-full justify-center items-center m-auto p-4">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <h2 className="font-semibold leading-none tracking-normal items-center flex-col justify-center flex">
                  <Icon />
                </h2>
                <h3 className="mt-1 mb-0 text-lg text-center font-medium text-primary">Bookmark It.</h3>

                <p className="mb-3 !mt-0.5 text-center text-sm font-normal text-muted-foreground">
                  Welcome, Sign in below.
                </p>
                <button
                  onClick={() => {
                    signInWithGoogle();
                  }}
                  className={cn(
                    'items-center !mt-4 max-w-sm justify-center text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 hover:bg-primary/80 active:scale-[0.98] rounded-xl bg-primary px-16 py-4 text-secondary font-medium flex space-x-2 h-[40px] w-full',
                    {
                      'bg-primary/80 cursor-default': loading,
                    }
                  )}
                >
                  {loading ? <Loader /> : <GoogleIcon />}
                  Continue with Google
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </ThemeProvider>
      <Toaster />
    </>
  );
}
