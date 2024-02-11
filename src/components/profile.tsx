'use client';

import { HelpCircleIcon, LogOut } from 'lucide-react';

import { cn } from 'lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { User } from '@supabase/supabase-js';
import supabase from 'lib/supabase';

const helpMailLink = 'mailto:support@bmrk.cc';

export default function Profile({
  className,
  user,
  onDone,
}: {
  className?: string;
  user: User | undefined;
  onDone?: () => void;
}) {
  if (!user || !user?.user_metadata?.avatar_url) {
    return null;
  }

  const signOut = async () => {
    await chrome.storage.local.set({ session: null });
    await supabase.auth.signOut();
    onDone?.();
  };

  return (
    <Avatar className={cn('h-8 w-8 group my-2 mr-3', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <AvatarImage
            className="group-active:scale-95 h-8 w-8 duration-150 transition-transform"
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.name}
          />
          <AvatarFallback className="font-medium h-8 w-8 text-pimary-foreground uppercase text-xl bg-accent">
            {user.user_metadata.name[0]}
          </AvatarFallback>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2">
          <DropdownMenuItem
            className="flex items-center cursor-pointer"
            onClick={() => {
              window.open(helpMailLink, '_blank');
            }}
          >
            <HelpCircleIcon className="h-4 w-4 mr-2.5" /> Help
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2.5" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Avatar>
  );
}
