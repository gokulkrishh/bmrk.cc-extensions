import { Badge } from 'components/ui/badge';

import { cn } from 'lib/utils';

import { Tag } from 'types/data';

type TagFilterBarProps = {
  tags: Tag[];
  selectedTag: Tag | null;
  onSelectTag: (tag: Tag | null) => void;
};

export default function TagFilterBar({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterBarProps) {
  if (!tags.length) return null;

  return (
    <div className="flex shrink-0 items-center gap-1.5 px-3 py-2 overflow-x-auto hidden-scrollbar mask-start-and-end border-b min-h-[36px]">
      <button onClick={() => onSelectTag(null)} className="shrink-0">
        <Badge
          className={cn(
            'font-normal cursor-pointer transition-all py-1 px-2.5 rounded-full text-xs',
            !selectedTag
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-primary-foreground hover:bg-accent',
          )}
          variant="secondary"
        >
          All
        </Badge>
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelectTag(selectedTag?.id === tag.id ? null : tag)}
          className="shrink-0"
        >
          <Badge
            className={cn(
              'font-normal cursor-pointer transition-all py-1 px-2.5 rounded-full text-xs',
              selectedTag?.id === tag.id
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-primary-foreground hover:bg-accent',
            )}
            variant="secondary"
          >
            {tag.name}
          </Badge>
        </button>
      ))}
    </div>
  );
}
