'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { cn } from '../../lib/cn';

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;

export function PopoverContent({
  className,
  children,
  align = 'start',
}: {
  className?: string;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={4}
        className={cn('z-50 rounded-md border border-border bg-card p-3 shadow-lg', className)}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}
