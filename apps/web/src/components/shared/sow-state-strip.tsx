import { cn } from '@sow-platform/ui';
import type { SowStatus } from '@/lib/data/sows';

const mainFlow: SowStatus[] = ['draft', 'submitted', 'in_review', 'approved'];

const labels: Record<SowStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
  archived: 'Archived',
};

export function SowStateStrip({ status }: { status: SowStatus }) {
  const branchStatus: SowStatus | null = [
    'rejected',
    'changes_requested',
    'archived',
  ].includes(status)
    ? status
    : null;
  const activeIndex = branchStatus ? mainFlow.length : mainFlow.indexOf(status);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {mainFlow.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium',
                i <= activeIndex && !branchStatus
                  ? 'border-primary bg-primary text-primary-foreground'
                  : i < activeIndex
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                    : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {labels[s]}
            </div>
            {i < mainFlow.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
        {branchStatus && (
          <>
            <div className="h-px w-6 bg-border" />
            <div className="rounded-full border border-destructive bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              {labels[branchStatus]}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
