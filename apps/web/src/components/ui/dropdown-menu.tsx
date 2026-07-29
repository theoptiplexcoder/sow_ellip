'use client';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/cn';

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

export function DropdownMenuContent({
  children,
  align = 'end',
  className,
}: {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        align={align}
        sideOffset={4}
        className={cn('z-50 min-w-[10rem] rounded-md border border-border bg-card p-1 shadow-lg', className)}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof RadixDropdownMenu.Item>) {
  return (
    <RadixDropdownMenu.Item
      className={cn(
        'flex cursor-pointer select-none items-center rounded-sm px-2.5 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}
