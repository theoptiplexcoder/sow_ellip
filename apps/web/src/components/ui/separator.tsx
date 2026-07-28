'use client';

import * as RadixSeparator from '@radix-ui/react-separator';
import { cn } from '../../lib/cn';

export function Separator({ className, ...props }: React.ComponentProps<typeof RadixSeparator.Root>) {
  return (
    <RadixSeparator.Root
      className={cn('shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px', className)}
      {...props}
    />
  );
}
