'use client';

import Link from 'next/link';
import {
  AlarmClock,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Gauge,
  Hourglass,
  Inbox,
  Layers,
  PenLine,
  Send,
  ShieldAlert,
  Ticket,
  Timer,
  Undo2,
  XCircle,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { SowStatusBadge, StatusPill } from '@/components/shared/status-badge';
import { SectionEyebrow } from '@/components/shared/section-eyebrow';
import { StatStrip } from '@/components/shared/stat-strip';
import { StatusStackBar } from '@/components/shared/status-stack-bar';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectsForUser } from '@/lib/data/projects';
import {
  sows,
  sowStatusLabels,
  type Sow,
  type SowStatus,
} from '@/lib/data/sows';
import { auditLogs } from '@/lib/data/audit-logs';
import { averageReviewDays } from '@/lib/sow-metrics';

const ROLE_TINT = {
  creator: 'var(--status-pending)',
  approver: 'var(--status-approved)',
  executive: 'var(--sidebar-primary)',
} as const;

function nextDeadline(sow: Sow) {
  return sow.sections.milestones[0]?.dueDate ?? sow.sections.periodEnd;
}

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function deadlineTone(days: number) {
  return days < 0
    ? 'var(--status-rejected)'
    : days <= 7
      ? 'var(--status-pending)'
      : 'var(--muted-foreground)';
}

function deadlineLabel(days: number) {
  return days < 0
    ? `${Math.abs(days)}d overdue`
    : days === 0
      ? 'Due today'
      : `Due in ${days}d`;
}

/** Soft, role-tinted pill chip shown in the page header. */
function RoleTag({ label, tint }: { label: string; tint: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        color: tint,
        borderColor: `color-mix(in oklab, ${tint} 30%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${tint} 9%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: tint }}
      />
      {label}
    </span>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={4}
        className="py-8 text-center text-sm text-muted-foreground"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

interface DocketItem {
  id: string;
  kind: 'approve' | 'revise';
  title: string;
  sub: string;
  href: string;
  tone: string;
  label: string;
  urgency: number;
}

/** The signature element: every actionable item across all of the participant's roles, in one ranked strip of ticket stubs. */
function DocketTicket({ item, index }: { item: DocketItem; index: number }) {
  const rotate = index % 2 === 0 ? '-0.6deg' : '0.6deg';
  return (
    <Link
      href={item.href}
      className="group relative flex w-64 shrink-0 snap-start flex-col gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-3.5 shadow-sm transition-all hover:rotate-0 hover:shadow-md"
      style={{ transform: `rotate(${rotate})` }}
    >
      <span
        className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full bg-background"
        aria-hidden
      />
      <span
        className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rounded-full bg-background"
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 rounded-[3px] border-[1.5px] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase"
          style={{ borderColor: item.tone, color: item.tone }}
        >
          {item.kind === 'approve' ? 'Approve' : 'Revise'}
        </span>
        <span
          className="text-[10px] font-medium whitespace-nowrap"
          style={{ color: item.tone }}
        >
          {item.label}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{item.title}</div>
        <div className="truncate text-xs text-muted-foreground">{item.sub}</div>
      </div>
      <ArrowRight className="size-3.5 self-end text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

export default function ParticipantDashboard() {
  const me = currentUsers.participant;
  const creatorProjects = getProjectsForUser(me.id, 'creator');
  const approverProjects = getProjectsForUser(me.id, 'approver');
  const execProjects = getProjectsForUser(me.id, 'executive_viewer');

  const hasCreator = creatorProjects.length > 0;
  const hasApprover = approverProjects.length > 0;
  const hasExec = execProjects.length > 0;
  const totalProjects = new Set(
    [...creatorProjects, ...approverProjects, ...execProjects].map((p) => p.id),
  ).size;

  const mySows = sows.filter((s) =>
    creatorProjects.some((p) => p.id === s.projectId),
  );
  const drafts = mySows.filter((s) => s.status === 'draft');
  const submitted = mySows.filter(
    (s) => s.status === 'submitted' || s.status === 'in_review',
  );
  const returned = mySows.filter((s) => s.status === 'changes_requested');
  const recentSows = [...mySows]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 6);

  const approverSows = sows.filter((s) =>
    approverProjects.some((p) => p.id === s.projectId),
  );
  const pending = approverSows.filter((s) => s.status === 'in_review');
  const approvedRecently = approverSows.filter((s) => s.status === 'approved');
  const rejected = approverSows.filter((s) => s.status === 'rejected');
  const avgReviewDays = averageReviewDays(approverSows);

  const execSows = sows.filter((s) =>
    execProjects.some((p) => p.id === s.projectId),
  );
  const blockedSows = execSows.filter(
    (s) => s.status === 'changes_requested' || s.status === 'rejected',
  );
  const execAvgApprovalDays = averageReviewDays(execSows);
  const pipelineData = (Object.keys(sowStatusLabels) as SowStatus[])
    .filter((status) => status !== 'archived')
    .map((status) => ({
      status: sowStatusLabels[status],
      key: status,
      count: execSows.filter((s) => s.status === status).length,
    }));
  const execAuditLogs = auditLogs
    .filter(
      (log) =>
        log.entityType === 'SOW' &&
        execSows.some((s) => log.entityName.includes(s.number)),
    )
    .slice(0, 6);
  const recentApprovals = execSows
    .filter((s) => s.status === 'approved')
    .slice(0, 5);

  // The docket: everything actionable across every role the participant holds, ranked by urgency.
  const docket: DocketItem[] = [
    ...pending.map((s) => {
      const days = daysUntil(nextDeadline(s));
      return {
        id: s.id,
        kind: 'approve' as const,
        title: s.title,
        sub: `${s.number} · requested by ${s.creator}`,
        href: `/participant/approvals/${s.id}`,
        tone: deadlineTone(days),
        label: deadlineLabel(days),
        urgency: days,
      };
    }),
    ...returned.map((s) => ({
      id: s.id,
      kind: 'revise' as const,
      title: s.title,
      sub: `${s.number} · ${s.projectName}`,
      href: `/participant/my-sows/${s.id}`,
      tone: 'var(--status-changes)',
      label: 'Needs revision',
      urgency: -1,
    })),
  ].sort((a, b) => a.urgency - b.urgency);

  const hasAnyRole = hasCreator || hasApprover || hasExec;
  const roleCount = [hasCreator, hasApprover, hasExec].filter(Boolean).length;
  const greeting = `Welcome back, ${me.name}. Your docket is scoped to ${totalProjects} assigned project${totalProjects === 1 ? '' : 's'}.`;

  if (!hasAnyRole) {
    return (
      <div>
        <PageHeader title="Docket" description={greeting} />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-6 text-muted-foreground" />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Nothing on your docket yet — you don&apos;t hold a role on any
            project. Once you&apos;re added to one, it shows up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Docket"
        description={greeting}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {hasCreator && <RoleTag label="Creator" tint={ROLE_TINT.creator} />}
            {hasApprover && (
              <RoleTag label="Approver" tint={ROLE_TINT.approver} />
            )}
            {hasExec && (
              <RoleTag label="Executive Viewer" tint={ROLE_TINT.executive} />
            )}
          </div>
        }
      />

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2.5">
          <Ticket className="size-4 text-muted-foreground" />
          <h2 className="font-display text-base font-semibold tracking-tight">
            Needs your action
          </h2>
          <span className="text-xs text-muted-foreground">
            {docket.length} item{docket.length === 1 ? '' : 's'} across all
            roles
          </span>
        </div>
        {docket.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            <AlarmClock className="size-4" />
            Docket&apos;s clear — nothing waiting on you right now.
          </div>
        ) : (
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3">
            {docket.map((item, i) => (
              <DocketTicket
                key={`${item.kind}-${item.id}`}
                item={item}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-10">
        {hasCreator && (
          <section>
            <SectionEyebrow
              icon={FileText}
              tint={ROLE_TINT.creator}
              label="What I'm building"
              description={`${mySows.length} SOW${mySows.length === 1 ? '' : 's'} across ${creatorProjects.length} project${creatorProjects.length === 1 ? '' : 's'}`}
            />
            <StatStrip
              items={[
                { label: 'Drafts', value: drafts.length, icon: PenLine },
                { label: 'Submitted', value: submitted.length, icon: Send },
                {
                  label: 'Returned for changes',
                  value: returned.length,
                  icon: Undo2,
                },
              ]}
            />
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SOW</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSows.length === 0 ? (
                    <EmptyRow>You haven&apos;t created any SOWs yet.</EmptyRow>
                  ) : (
                    recentSows.map((s) => (
                      <TableRow key={s.id} className="cursor-pointer">
                        <TableCell className="max-w-0">
                          <Link
                            href={`/participant/my-sows/${s.id}`}
                            className="block hover:opacity-80"
                          >
                            <div className="truncate font-medium">
                              {s.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {s.number}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.projectName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.updatedAt}
                        </TableCell>
                        <TableCell className="text-right">
                          <SowStatusBadge status={s.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        {hasApprover && (
          <section>
            <SectionEyebrow
              icon={Hourglass}
              tint={ROLE_TINT.approver}
              label="Waiting on me"
              description={`${pending.length} pending decision${pending.length === 1 ? '' : 's'}`}
            />
            <StatStrip
              items={[
                { label: 'Pending', value: pending.length, icon: Hourglass },
                {
                  label: 'Approved recently',
                  value: approvedRecently.length,
                  icon: CheckCircle2,
                },
                { label: 'Rejected', value: rejected.length, icon: XCircle },
                {
                  label: 'Avg. review time',
                  value:
                    avgReviewDays === null
                      ? '—'
                      : `${avgReviewDays.toFixed(1)}d`,
                  icon: Timer,
                },
              ]}
            />
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs text-muted-foreground">
                Sorted by deadline
              </span>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/participant/approvals" />}
              >
                View all
              </Button>
            </div>
            {pending.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                Your approval queue is clear.
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {pending.map((s) => {
                  const days = daysUntil(nextDeadline(s));
                  const tone = deadlineTone(days);
                  const pct =
                    days < 0
                      ? 100
                      : Math.max(6, 100 - Math.min(days, 14) * (100 / 14));
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/participant/approvals/${s.id}`}
                        className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-muted/40"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{s.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.number} · {s.projectName} · requested by{' '}
                            {s.creator}
                          </div>
                          <div className="mt-1.5 h-1 w-32 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: tone,
                              }}
                            />
                          </div>
                        </div>
                        <span
                          className="shrink-0 text-xs font-medium whitespace-nowrap"
                          style={{ color: tone }}
                        >
                          {deadlineLabel(days)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {hasExec && (
          <section>
            <SectionEyebrow
              icon={Layers}
              tint={ROLE_TINT.executive}
              label="Program health"
              description={`${execSows.length} SOWs across ${execProjects.length} project${execProjects.length === 1 ? '' : 's'}`}
            />
            <StatStrip
              items={[
                { label: 'Pipeline', value: execSows.length, icon: Layers },
                {
                  label: 'Blocked',
                  value: blockedSows.length,
                  icon: ShieldAlert,
                },
                {
                  label: 'Avg. approval time',
                  value:
                    execAvgApprovalDays === null
                      ? '—'
                      : `${execAvgApprovalDays.toFixed(1)}d`,
                  icon: Gauge,
                },
                {
                  label: 'Recent approvals',
                  value: recentApprovals.length,
                  icon: BadgeCheck,
                },
              ]}
            />

            <div className="rounded-lg border border-border p-4">
              {execSows.length === 0 ? (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  No SOWs in your pipeline.
                </p>
              ) : (
                <StatusStackBar data={pipelineData} total={execSows.length} />
              )}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Blocked SOWs
                </h3>
                {blockedSows.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nothing blocked right now.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {blockedSows.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">{s.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.number} · {s.projectName}
                          </div>
                        </div>
                        <SowStatusBadge status={s.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Recent approvals
                </h3>
                {recentApprovals.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No approvals yet.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {recentApprovals.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">{s.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.number} · {s.projectName} · {s.updatedAt}
                          </div>
                        </div>
                        <SowStatusBadge status={s.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Audit history
              </h3>
              {execAuditLogs.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No recent activity.
                </p>
              ) : (
                <ScrollArea className="h-64 pr-4">
                  <ul className="relative flex flex-col gap-4 border-l border-border pl-6">
                    {execAuditLogs.map((log) => (
                      <li
                        key={log.id}
                        className="relative flex items-start gap-3"
                      >
                        <span className="absolute top-1 -left-[29px] size-2.5 rounded-full border-2 border-background bg-muted-foreground" />
                        <Avatar className="size-7">
                          <AvatarFallback className="text-xs">
                            {log.actor
                              .split(' ')
                              .map((p) => p[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <span className="font-medium">{log.actor}</span>{' '}
                          <span className="text-muted-foreground">
                            {log.action}
                          </span>{' '}
                          <span className="font-medium">{log.entityName}</span>
                          <div className="text-xs text-muted-foreground">
                            {log.timestamp}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </section>
        )}

        {hasCreator &&
          creatorProjects.length > 0 &&
          !hasApprover &&
          !hasExec && (
            <section>
              <SectionEyebrow
                icon={Layers}
                tint={ROLE_TINT.creator}
                label="Projects"
                description="Everything you're building against"
              />
              <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {creatorProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/participant/projects/${p.id}`}
                      className="flex items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.clientName} · {p.sowCount} SOW
                          {p.sowCount === 1 ? '' : 's'}
                        </div>
                      </div>
                      <StatusPill
                        active={p.status === 'active'}
                        activeLabel="Active"
                        inactiveLabel={
                          p.status === 'on_hold' ? 'On Hold' : 'Completed'
                        }
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
      </div>

      {roleCount > 1 && (
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Viewing every role you hold at once — no tabs to dig through.
        </p>
      )}
    </div>
  );
}
