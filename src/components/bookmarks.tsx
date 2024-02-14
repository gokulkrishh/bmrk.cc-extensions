import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import supabase, { getUser } from 'lib/supabase';
import { cn } from 'lib/utils';

import { BookmarkInsertModified, BookmarkModified } from 'types/data';

import BookmarkFavicon from './bookmark-favicon';
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
  const [result, setResult] = useState<BookmarkModified[]>([]);
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
        setResult(data ?? []);
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
        setResult(data as BookmarkModified[]);
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
      if (request.type === 'refreshBookmark') {
        const invalidateCache = true;
        fetchAndCacheBookmarks(invalidateCache);
      }
    };
    fetchAndCacheBookmarks();
    chrome.runtime.onMessage.addListener(listenerCallback);
    return () => chrome.runtime.onMessage.removeListener(listenerCallback);
  }, [fetchAndCacheBookmarks]);

  const onChange = (value: string) => {
    if (!value?.length) {
      setResult(bookmarks);
    }

    const filteredBookmark = bookmarks.filter((bookmark) => {
      return (
        bookmark.title?.toLowerCase().includes(value.toLowerCase()) ||
        bookmark.url?.toLowerCase().includes(value.toLowerCase())
      );
    });

    setResult(filteredBookmark);
  };

  const openBookmark = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="flex flex-col w-full mt-[49px] overflow-hidden">
        <ThemeToggle className="absolute top-2 rounded-full right-24" />
        <button
          title="Refresh bookmarks"
          className="absolute top-2 rounded-full right-14 opacity-80 transition-all cursor-pointer border-transparent hover:bg-accent hover:border hover:border-input border active:bg-accent duration-200 z-10 p-2"
          onClick={() => {
            const invalidateCache = true;
            fetchAndCacheBookmarks(invalidateCache);
          }}
        >
          <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
        </button>

        <CommandWithoutDialog className="mt-10">
          <CommandInput
            autoFocus
            className={cn(
              'flex h-11 w-full text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
            )}
            ref={inputRef}
            placeholder="Search bookmarks"
            onValueChange={(value) => onChange(value)}
            disabled={loading}
          />
          <CommandList>
            <CommandGroup heading="All Bookmarks">
              {loading ? (
                <CommandLoading>
                  <div className="flex justify-center my-6">
                    <Loader />
                  </div>
                </CommandLoading>
              ) : null}

              {result.map((bookmark: BookmarkModified) => {
                const url = new URL(bookmark.url);
                url.searchParams.append('utm_source', 'bmrk.cc');
                return (
                  <CommandItem
                    className={cn('flex items-center')}
                    onSelect={() => {
                      openBookmark(url.href);
                    }}
                    key={bookmark.id}
                  >
                    <BookmarkFavicon
                      url={bookmark.url}
                      title={bookmark.title ?? ''}
                      className="mr-3 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{bookmark.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {url.hostname}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandEmpty>No result.</CommandEmpty>
          </CommandList>
        </CommandWithoutDialog>
      </div>
    </>
  );
}

const MemoizedBookmarks = memo(Bookmarks);

export default MemoizedBookmarks;
