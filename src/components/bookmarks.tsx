import supabase, { getUser } from 'lib/supabase';
import { useEffect, useState } from 'react';
import { BookmarkModified } from 'types/data';
import Loader from './loader';
import { toast } from 'sonner';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkModified[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
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
        // alert(JSON.stringify(data, null, 2));
        setBookmarks(data ?? []);
      } catch (error) {
        toast.error('Error getting bookmarks, please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  return (
    <div className="flex w-full h-full p-2">
      {!bookmarks.length && !loading ? (
        <p className="flex w-full text-muted-foreground text-base justify-center items-center text-center h-full">
          Bookmarks are empty.
        </p>
      ) : null}
      {loading ? (
        <div className="flex w-full justify-center items-center h-full text-sm">
          <Loader className="w-6 h-6 mr-2" /> Loading...
        </div>
      ) : null}
      {bookmarks.length ? (
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center w-full h-full">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id}>{bookmark.title}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
