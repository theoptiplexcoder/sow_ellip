import { Avatar, AvatarFallback, Badge } from '@sow-platform/ui';
import {
  CheckCircle2,
  CircleDashed,
  MessageSquareWarning,
  XCircle,
} from 'lucide-react';
import type { WorkflowInstanceStep } from '@/lib/data/sows';
import { getUser } from '@/lib/data/users';

const stepMeta: Record<
  WorkflowInstanceStep['status'],
  { icon: typeof CheckCircle2; className: string; label: string }
> = {
  approved: {
    icon: CheckCircle2,
    className: 'text-emerald-600',
    label: 'Approved',
  },
  rejected: { icon: XCircle, className: 'text-red-600', label: 'Rejected' },
  changes_requested: {
    icon: MessageSquareWarning,
    className: 'text-orange-600',
    label: 'Changes Requested',
  },
  pending: {
    icon: CircleDashed,
    className: 'text-amber-600',
    label: 'Pending',
  },
  not_reached: {
    icon: CircleDashed,
    className: 'text-muted-foreground/50',
    label: 'Not Reached',
  },
};

export function WorkflowTimeline({ steps }: { steps: WorkflowInstanceStep[] }) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No workflow instance attached yet.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, i) => {
        const meta = stepMeta[step.status];
        const Icon = meta.icon;
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Icon className={`size-5 ${meta.className}`} />
              {i < steps.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{step.name}</span>
                <Badge variant="outline" className={meta.className}>
                  {meta.label}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {(() => {
                  const approver = getUser(step.actor);
                  const name = approver?.name ?? step.actor;
                  const initials =
                    approver?.avatarInitials ??
                    name
                      .split(' ')
                      .map((p) => p[0])
                      .join('');

                  return (
                    <>
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[10px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {name}
                    </>
                  );
                })()}
                {step.decidedAt && <span>· {step.decidedAt}</span>}
              </div>
              {step.comment && (
                <p className="mt-2 rounded-md bg-muted p-2 text-xs text-foreground">
                  {step.comment}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
