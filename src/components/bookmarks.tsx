import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import supabase, { getUser } from 'lib/supabase';
import { cn } from 'lib/utils';

import { BookmarkInsertModified, BookmarkModified } from 'types/data';

import BookmarkFavicon from './bookmark-favicon';
import BookmarkMenu from './bookmark-menu';
import Loader from './loader';
import { ThemeToggle } from './theme-toggle';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandWithoutDialog,
} from './ui/command';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkModified[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchBookmarks = useCallback(
    async (callback: (data: BookmarkModified[]) => void) => {
      try {
        setLoading(true);
        const user = await getUser();
        const { data, error } = await supabase
          .from('bookmarks')
          .select(`*, bookmarks_tags (tags!inner (id,name))`)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .returns<BookmarkModified[]>();
        if (error) throw error;
        chrome.storage.local.set({ cache: data, cacheTime: Date.now() }, () => {
          callback(data);
          focusInput();
        });
        setBookmarks(data ?? []);
      } catch (error) {
        toast.error('Error getting bookmarks, please try again.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cacheBookmarks = useCallback(
    async (
      callback: (data: unknown) => void,
      invalidateCache?: boolean | undefined,
    ) => {
      chrome.storage.local.get(['cache', 'cacheTime'], (items) => {
        if (
          !invalidateCache &&
          items.cache &&
          items.cacheTime &&
          items.cacheTime
        ) {
          if (items.cacheTime > Date.now() - 3600 * 1000) {
            return callback(items.cache); // Serialization is auto, so nested objects are no problem
          }
        }

        fetchBookmarks(callback);
      });
    },
    [fetchBookmarks],
  );

  const fetchAndCacheBookmarks = useCallback(
    (invalidateCache?: boolean | undefined) => {
      return cacheBookmarks((data: unknown) => {
        setBookmarks(data as BookmarkModified[]);
        setLoading(false);
      }, invalidateCache);
    },
    [cacheBookmarks],
  );

  const focusInput = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  useEffect(() => {
    const listenerCallback = async (request: {
      payload: BookmarkInsertModified;
      type: string;
    }) => {
      if (request.type === 'refreshBookmarks') {
        const invalidateCache = true;
        fetchAndCacheBookmarks(invalidateCache);
      } else if (request.type === 'forceLogout') {
        setBookmarks([]);
        await chrome.storage.local.set({ cache: [], cacheTime: -1 });
        await supabase.auth.signOut();
      }
    };
    fetchAndCacheBookmarks();
    chrome.runtime.onMessage.addListener(listenerCallback);
    return () => chrome.runtime.onMessage.removeListener(listenerCallback);
  }, [fetchAndCacheBookmarks]);

  const openBookmark = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="flex flex-col w-full mt-[49px] overflow-hidden">
        <ThemeToggle className="absolute top-2 rounded-full right-24" />
        <button
          title="Refresh bookmarks"
          className="absolute top-2 rounded-full right-14 transition-all cursor-pointer border-transparent hover:bg-accent hover:border hover:border-input border active:bg-accent duration-200 z-10 p-2"
          onClick={() => {
            const invalidateCache = true;
            fetchAndCacheBookmarks(invalidateCache);
          }}
        >
          <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
        </button>

        <CommandWithoutDialog className="mt-10" loop>
          <CommandInput
            autoFocus
            className={cn(
              'flex h-11 w-full text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
            )}
            ref={inputRef}
            placeholder="Search bookmarks"
            disabled={loading}
          />
          <CommandList>
            {!loading ? <CommandEmpty>No result found.</CommandEmpty> : null}
            <CommandGroup heading="All Bookmarks">
              {loading ? (
                <CommandLoading>
                  <div className="flex justify-center my-6">
                    <Loader />
                  </div>
                </CommandLoading>
              ) : null}
              {bookmarks.map((bookmark: BookmarkModified) => {
                const url = new URL(bookmark.url);
                url.searchParams.append('utm_source', 'bmrk.cc');
                return (
                  <CommandItem
                    className={cn('flex items-center justify-between')}
                    onSelect={() => {
                      openBookmark(url.href);
                    }}
                    value={`${bookmark.title}-${url.href}`}
                    key={bookmark.id}
                  >
                    <BookmarkFavicon
                      url={bookmark.url}
                      title={bookmark.title ?? ''}
                      className="mr-3 shrink-0"
                    />
                    <div className="flex items-start justify-between w-full">
                      <div className="flex flex-col">
                        <span className="text-sm">{bookmark.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {url.hostname}
                        </span>
                      </div>
                      <BookmarkMenu data={bookmark} />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </CommandWithoutDialog>
      </div>
    </>
  );
}

const MemoizedBookmarks = memo(Bookmarks);

export default MemoizedBookmarks;
