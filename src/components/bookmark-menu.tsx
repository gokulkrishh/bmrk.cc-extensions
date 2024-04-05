import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';

import { cn } from 'lib/utils';

import { BookmarkModified } from 'types/data';

import { DeleteIcon, LinkIcon, MoreMenuIcon } from './icons';

type CardMenuProps = {
  data: BookmarkModified;
  onDelete: (data: BookmarkModified) => Promise<void>;
};

export default function BookmarkMenu({ data, onDelete }: CardMenuProps) {
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
          <MoreMenuIcon className="fill-muted-foreground !h-4 !w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              navigator.clipboard.writeText(siteUrl.href);
              toast.success('Link copied to clipboard');
            }}
          >
            <LinkIcon className="h-4 w-4  mr-2" /> Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async (event) => {
              event.stopPropagation();
              await onDelete(data);
            }}
            className="!text-red-600 focus:bg-red-100 active:bg-red-100 dark:focus:bg-red-800/30 dark:active:bg-red-800/30"
          >
            <DeleteIcon className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
