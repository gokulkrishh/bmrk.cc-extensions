import supabase, { getUser } from 'lib/supabase';
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { BookmarkInsertModified, BookmarkModified } from 'types/data';
import Loader from './loader';
import { toast } from 'sonner';
import BookmarkFavicon from './bookmark-favicon';
import { SearchIcon } from 'lucide-react';
import { cn } from 'lib/utils';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkModified[]>([]);
  const [result, setResult] = useState<BookmarkModified[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchBookmarks = useCallback(async () => {
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
      setBookmarks(data ?? []);
      setResult(data ?? []);
      focusInput();
    } catch (error) {
      toast.error('Error getting bookmarks, please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBookmark = useCallback(
    async (payload: BookmarkInsertModified) => {
      if (payload?.url) {
        try {
          const user = await getUser();
          const { error } = await supabase.from('bookmarks').insert({
            ...payload,
            user_id: user?.id,
            metadata: { is_via_extension: true },
          } as BookmarkInsertModified);
          if (error) throw error;
          fetchBookmarks();
        } catch (error) {
          toast.error('Error saving bookmark, please try again.');
        }
      } else {
        toast.error('URL is not allowed.');
      }
    },
    [fetchBookmarks]
  );

  const focusInput = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  useEffect(() => {
    const listenerCallback = async (request: { payload: BookmarkInsertModified; type: string }) => {
      if (request.type === 'saveBookmark') {
        await saveBookmark(request.payload as BookmarkInsertModified);
      }
    };
    fetchBookmarks();
    chrome.runtime.onMessage.addListener(listenerCallback);
    return () => chrome.runtime.onMessage.removeListener(listenerCallback);
  }, [fetchBookmarks, saveBookmark]);

  const onChange = (value: string) => {
    if (!value?.length) {
      setResult(bookmarks);
      focusInput();
    }

    const filteredBookmark = bookmarks.filter((bookmark) => {
      return (
        bookmark.title?.toLowerCase().includes(value.toLowerCase()) ||
        bookmark.url?.toLowerCase().includes(value.toLowerCase())
      );
    });

    setResult(filteredBookmark);
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex fixed left-0 right-0 top-[49px] items-center bg-background border-b px-4">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className={cn(
              'flex h-11 w-full bg-background rounded-xl py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
            )}
            ref={inputRef}
            placeholder="Search bookmarks"
            type="text"
            onChange={(event) => onChange(event.target.value)}
            autoFocus={true}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col mt-[100px] h-full w-full">
          {!result.length && !loading ? (
            <p className="flex w-full mt-5 text-muted-foreground text-base justify-center items-center text-center h-full">
              Bookmarks are empty.
            </p>
          ) : null}
          {loading ? (
            <div className="flex w-full mt-4 justify-center items-center h-full text-sm">
              <Loader className="w-6 h-6 mr-2" />
            </div>
          ) : null}
        </div>
        <div className="flex fixed left-0 right-0 top-[95px] h-full overflow-y-auto items-start flex-col w-full p-2 px-4">
          {result.map((bookmark: BookmarkModified, index: number) => {
            const url = new URL(bookmark.url);
            url.searchParams.append('utm_source', 'bmrk.cc');
            return (
              <a
                className={cn('py-1 hover:opacity-80 flex items-center', {
                  'mb-[100px]': index === result.length - 1,
                })}
                target="_blank"
                href={url.href}
                key={bookmark.id}
              >
                <BookmarkFavicon url={bookmark.url} title={bookmark.title ?? ''} className="mr-3 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm">{bookmark.title}</span>
                  <span className="text-xs text-muted-foreground">{url.hostname}</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}

const MemoizedBookmarks = memo(Bookmarks);

export default MemoizedBookmarks;
