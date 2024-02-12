import { useCallback, useEffect, useState } from 'react';

import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

import Bookmarks from 'components/bookmarks';
import { ThemeProvider } from 'components/context/theme-context';
import { GoogleIcon, Icon } from 'components/icons';
import Loader from 'components/loader';
import Profile from 'components/profile';
import { Toaster } from 'components/ui/sonner';

import { formatDate } from 'lib/date';
import supabase, { setSession } from 'lib/supabase';
import { cn } from 'lib/utils';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setLoading(true);
    setSession();
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
        if (currentSession?.user) {
          setUser(currentSession?.user);
        }
        setLoading(false);
      },
    );
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const onDone = () => {
    try {
      setLoading(true);
      setUser(null);
    } catch (error) {
      toast.error('Error signing out, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: chrome.identity.getRedirectURL(),
        },
      });
      if (error) throw error;
      await chrome.tabs.create({ url: data.url });
    } catch (error) {
      toast.error('Error signing in, please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const SignIn = () => (
    <div className="flex h-full justify-center items-center m-auto p-4">
      <div className="flex flex-col text-center sm:text-left">
        <a
          className="flex items-center justify-center"
          href="https://app.bmrk.cc"
          target="_blank"
        >
          <h2 className="font-semibold leading-none tracking-normal items-center flex-col justify-center flex">
            <Icon />
          </h2>
        </a>
        <h3 className="mt-1 mb-0 text-lg text-center font-medium text-primary">
          Bookmark It.
        </h3>
        <p className="mb-3 !mt-0.5 text-center text-sm font-normal text-muted-foreground">
          Welcome, Sign in below.
        </p>
        <button
          onClick={() => {
            signInWithGoogle();
          }}
          className={cn(
            'items-center !mt-2 max-w-sm justify-center text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 hover:bg-primary/80 active:scale-[0.98] rounded-xl bg-primary px-12 py-3.5 text-secondary font-medium flex space-x-2 h-[38px] w-full',
            {
              'bg-primary/80 cursor-default': loading,
            },
          )}
        >
          {loading ? <Loader /> : <GoogleIcon />}
          Continue with Google
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div
          className={cn('flex flex-col w-[350px] min-h-[250px] bg-background', {
            'h-[500px]': user,
          })}
        >
          {user && !loading ? (
            <div className="flex fixed left-0 right-0 top-0 bg-background w-full border-b border-input justify-between">
              <div className="flex items-center shrink-0">
                <a
                  className="flex items-center justify-center active:opacity-85"
                  href="https://app.bmrk.cc"
                  target="_blank"
                >
                  <h2 className="shrink-0 mt-1 mb-1 ml-2 text-center font-medium text-primary mr-2 leading-none tracking-normal items-center justify-center flex">
                    <Icon className="w-9 h-9" />
                    <div className="flex ml-1.5 flex-col items-start">
                      <span className="font-medium text-[15px]  tracking-wide">
                        Bookmark It.
                      </span>
                      <span className="text-[11px] mt-1 inline-block font-normal text-muted-foreground">
                        {formatDate(new Date().toISOString())}
                      </span>
                    </div>
                  </h2>
                </a>
              </div>
              <Profile user={user} onDone={onDone} />
            </div>
          ) : null}
          {user && !loading ? <Bookmarks /> : null}
          {!loading && !user ? <SignIn /> : null}
        </div>
      </ThemeProvider>
      <Toaster richColors />
    </>
  );
}
