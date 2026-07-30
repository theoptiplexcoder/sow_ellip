'use client';

import { ChevronDown } from 'lucide-react';
import { matchTypeForApproverCount, type Approver, type MatchType } from '@sow/workflows';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import { Checkbox } from '../../ui/checkbox';
import { cn } from '../../../lib/cn';

export function StepApproversEditor({
  approverIds,
  approvers,
  matchType,
  onChange,
  className,
}: {
  approverIds: string[];
  approvers: Approver[];
  matchType: MatchType;
  onChange: (patch: { approverIds: string[]; matchType: MatchType }) => void;
  className?: string;
}) {
  function toggle(id: string) {
    const next = approverIds.includes(id) ? approverIds.filter((a) => a !== id) : [...approverIds, id];
    onChange({ approverIds: next, matchType: matchTypeForApproverCount(next.length, matchType) });
  }

  const names = approverIds.map((id) => approvers.find((a) => a.id === id)?.name ?? 'Unknown');
  const summary = names.length === 0 ? 'Select employees' : names.join(` ${matchType} `);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full sm:w-48 shrink-0 items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40',
            className,
          )}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-1">
          {approvers.map((a) => (
            <Checkbox
              key={a.id}
              checked={approverIds.includes(a.id)}
              onCheckedChange={() => toggle(a.id)}
              label={a.name}
              className="w-full py-1"
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
