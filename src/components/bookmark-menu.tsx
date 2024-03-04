import { Link, MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';

import { cn } from 'lib/utils';

import { BookmarkModified } from 'types/data';

type CardMenuProps = {
  data: BookmarkModified;
};

export default function BookmarkMenu({ data }: CardMenuProps) {
  const { url } = data;

  const siteUrl = new URL(url);
  siteUrl.searchParams.append('utm_source', 'bmrk.cc');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            `cursor-pointer relative -top-[5px] h-9 w-9 -mr-2 flex items-center justify-center transition-colors rounded-full hover:bg-accent active:bg-accent shrink-0`,
            '',
          )}
        >
          <MoreVerticalIcon className="fill-muted-foreground !h-4 !w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              navigator.clipboard.writeText(siteUrl.href);
              toast.success('Link copied to clipboard.');
            }}
          >
            <Link className="h-4 w-4  mr-2.5" /> Copy link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
