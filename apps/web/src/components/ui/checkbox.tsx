'use client';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Checkbox({
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
      <RadixCheckbox.Root
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(val === true)}
        className="flex h-4 w-4 items-center justify-center rounded border border-border bg-card data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      >
        <RadixCheckbox.Indicator>
          <Check className="h-3 w-3 text-primary-foreground" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
