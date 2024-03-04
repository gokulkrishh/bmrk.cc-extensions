import { Badge } from 'components/ui/badge';

import { cn } from 'lib/utils';

import { BookmarkModified } from 'types/data';

export default function TagBadge({
  data,
  avoidHover,
  className,
}: {
  data: BookmarkModified;
  avoidHover?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-y-1.5 items-center overflow-x-scroll max-w-[250px] w-full hidden-scrollbar mask-start-and-end ${className}`}
    >
      {data?.bookmarks_tags?.map(({ tags: { id, name } }) => {
        return (
          <a
            className="border hover:bg-accent/80 dark:hover:bg-accent dark:active:bg-accent transition-colors focus:bg-accent/80 rounded-full mr-2"
            key={id}
            href={`https://app.bmrk.cc/tags/${name}?utm_source=bookmark-it-chrome-extension`}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge
              className={cn(
                'font-normal transition-all bg-primary-foreground py-1 w-max',
                {
                  'hover:bg-primary-foreground cursor-default': avoidHover,
                },
              )}
              variant="secondary"
            >
              {name}
            </Badge>
          </a>
        );
      })}
    </div>
  );
}
