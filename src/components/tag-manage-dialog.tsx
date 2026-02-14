import { useCallback, useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';

import { CheckIcon, PlusIcon, SearchIcon } from 'components/icons';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from 'components/ui/dialog';

import supabase, { getUser } from 'lib/supabase';
import { cn } from 'lib/utils';

import { BookmarkModified, Tag } from 'types/data';

import Loader from './loader';

type TagManageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: BookmarkModified;
  tags: Tag[];
  onDone: () => void;
};

export default function TagManageDialog({
  open,
  onOpenChange,
  bookmark,
  tags,
  onDone,
}: TagManageDialogProps) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignedTagIds, setAssignedTagIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (open) {
      const ids = new Set(
        bookmark.bookmarks_tags.map(({ tags: { id } }) => id),
      );
      setAssignedTagIds(ids);
      setSearch('');
    }
  }, [open, bookmark]);

  const filteredTags = useMemo(() => {
    if (!search.trim()) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tags, search]);

  const exactMatch = useMemo(() => {
    if (!search.trim()) return true;
    return tags.some(
      (tag) => tag.name.toLowerCase() === search.trim().toLowerCase(),
    );
  }, [tags, search]);

  const toggleTag = useCallback(
    async (tagId: number, isAssigned: boolean) => {
      try {
        setLoading(true);
        const user = await getUser();
        if (!user?.id) return;

        if (isAssigned) {
          // Unassign tag
          const { error } = await supabase
            .from('bookmarks_tags')
            .delete()
            .eq('bookmark_id', bookmark.id)
            .eq('tag_id', tagId);

          if (error) throw error;

          setAssignedTagIds((prev) => {
            const nextSet = new Set(prev);
            nextSet.delete(tagId);
            return nextSet;
          });
          toast.success('Tag removed');
        } else {
          // Assign tag
          const { error } = await supabase
            .from('bookmarks_tags')
            .insert({
              bookmark_id: bookmark.id,
              tag_id: tagId,
              user_id: user.id,
            });

          if (error) throw error;

          // Update tag's updated_at
          await supabase
            .from('tags')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', tagId);

          setAssignedTagIds((prev) => new Set(prev).add(tagId));
          toast.success('Tag added');
        }

        onDone();
      } catch {
        toast.error('Failed to update tag');
      } finally {
        setLoading(false);
      }
    },
    [bookmark.id, onDone],
  );

  const createAndAssignTag = useCallback(async () => {
    const tagName = search.trim();
    if (!tagName) return;

    try {
      setLoading(true);
      const user = await getUser();
      if (!user?.id) return;

      // Create the new tag
      const { data: newTag, error: tagError } = await supabase
        .from('tags')
        .insert({ name: tagName, user_id: user.id })
        .select()
        .single();

      if (tagError) throw tagError;

      // Assign tag to bookmark
      const { error: linkError } = await supabase
        .from('bookmarks_tags')
        .insert({
          bookmark_id: bookmark.id,
          tag_id: newTag.id,
          user_id: user.id,
        });

      if (linkError) throw linkError;

      // Increment tags usage
      await supabase.rpc('increment_tags_usage', {
        user_id: user.id,
        count: 1,
      });

      setAssignedTagIds((prev) => new Set(prev).add(newTag.id));
      setSearch('');
      toast.success(`Tag "${tagName}" created`);
      onDone();
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setLoading(false);
    }
  }, [search, bookmark.id, onDone]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (search.trim() && !exactMatch) {
          createAndAssignTag();
        }
      }
    },
    [search, exactMatch, createAndAssignTag],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[300px] p-0 gap-0 max-w-[calc(100%-16px)]"
      >
        <DialogTitle className="text-sm font-medium px-3 pt-3 pb-2">
          Manage Tags
        </DialogTitle>
        <div className="flex items-center border-y px-3">
          <SearchIcon className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          <input
            className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search or create tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto py-1">
          {loading && (
            <div className="flex justify-center py-3">
              <Loader />
            </div>
          )}
          {!loading && filteredTags.length === 0 && !search.trim() && (
            <p className="text-center text-sm text-muted-foreground py-3">
              No tags yet
            </p>
          )}
          {!loading &&
            filteredTags.map((tag) => {
              const isAssigned = assignedTagIds.has(tag.id);
              return (
                <button
                  key={tag.id}
                  className={cn(
                    'flex items-center w-full px-3 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleTag(tag.id, isAssigned);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <span
                    className={cn(
                      'h-4 w-4 mr-2 shrink-0 flex items-center justify-center rounded border',
                      isAssigned
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-input',
                    )}
                  >
                    {isAssigned && <CheckIcon className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{tag.name}</span>
                </button>
              );
            })}
          {!loading && search.trim() && !exactMatch && (
            <button
              className="flex items-center w-full px-3 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors text-blue-600 dark:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                createAndAssignTag();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <PlusIcon className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">
                Create &ldquo;{search.trim()}&rdquo;
              </span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
