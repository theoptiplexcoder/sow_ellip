'use client';

import * as RadixLabel from '@radix-ui/react-label';
import { cn } from '../../lib/cn';

export function Label({ className, ...props }: React.ComponentProps<typeof RadixLabel.Root>) {
  return (
    <RadixLabel.Root
      className={cn('mb-1.5 block text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}
