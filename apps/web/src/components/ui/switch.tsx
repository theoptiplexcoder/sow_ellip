'use client';

import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from '../../lib/cn';

export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={cn('inline-flex items-center gap-2', className)}>
      <RadixSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative h-5 w-9 rounded-full bg-muted transition-colors data-[state=checked]:bg-primary"
      >
        <RadixSwitch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
      </RadixSwitch.Root>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
