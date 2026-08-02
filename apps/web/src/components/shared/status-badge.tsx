import { cn } from '@sow-platform/ui';
import type { SowStatus } from '@/lib/data/sows';

interface StampConfig {
  label: string;
  color: string;
  rotate?: string;
}

const sowStatusStamps: Record<SowStatus, StampConfig> = {
  draft: { label: 'Draft', color: 'var(--muted-foreground)' },
  submitted: { label: 'Submitted', color: 'var(--muted-foreground)' },
  in_review: { label: 'In Review', color: 'var(--status-pending)' },
  approved: {
    label: 'Approved',
    color: 'var(--status-approved)',
    rotate: '-rotate-2',
  },
  rejected: {
    label: 'Rejected',
    color: 'var(--status-rejected)',
    rotate: 'rotate-2',
  },
  changes_requested: {
    label: 'Changes Requested',
    color: 'var(--status-changes)',
    rotate: 'rotate-2',
  },
  archived: { label: 'Archived', color: 'var(--muted-foreground)' },
};

/** Approval-stamp styled status pill: bordered, uppercase, and slightly rotated for finalized states. */
function Stamp({ label, color, rotate }: StampConfig) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-[3px] border-[1.5px] px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
        rotate,
      )}
      style={{ borderColor: color, color }}
    >
      {label}
    </span>
  );
}

export function SowStatusBadge({ status }: { status: SowStatus }) {
  const stamp = sowStatusStamps[status];
  return <Stamp {...stamp} />;
}

export function StatusPill({
  active,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <Stamp
      label={active ? activeLabel : inactiveLabel}
      color={active ? 'var(--status-approved)' : 'var(--muted-foreground)'}
    />
  );
}
