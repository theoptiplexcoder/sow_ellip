'use client';

import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Badge } from '../../ui/badge';
import { CHART_COLORS, baseBarOptions } from './chart-theme';
import {
  SOW_STATUS_COUNTS,
  AVG_STATUS_DURATION,
  STUCK_IN_CHANGES_REQUESTED,
  APPROVER_PENDING,
  WORKFLOW_TURNAROUND,
  WORKFLOW_REJECTION_RATE,
  ROLE_ACTIVITY,
  INACTIVE_USERS,
  TEMPLATE_USAGE,
  IDLE_WORKFLOWS,
  CLIENT_PROJECT_COUNTS,
  CLIENT_SOW_VALUE,
  RECENT_AUDIT_ENTRIES,
} from './mock-data';

const STUCK_THRESHOLDS = [3, 5, 10] as const;

function Section({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="rounded-xl border border-border bg-card scroll-mt-24">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ChartBlock({
  label,
  height = 220,
  children,
}: {
  label: string;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-muted-foreground">{label}</p>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function singleSeriesBar(labels: string[], values: number[]) {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: CHART_COLORS.series1,
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };
}

export function DashboardKpis() {
  const [stuckThreshold, setStuckThreshold] = useState<(typeof STUCK_THRESHOLDS)[number]>(5);
  const stuckSows = STUCK_IN_CHANGES_REQUESTED.filter(
    (s) => s.daysInStatus > stuckThreshold,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Insights & KPIs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Organization-wide metrics across SOWs, approvals, team, templates, and clients.
        </p>
      </div>

      <Section id="sows" title="SOWs" description="Volume, status duration, and stalled work.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartBlock label="Total SOWs by status (org-wide)">
            <Bar
              data={singleSeriesBar(
                SOW_STATUS_COUNTS.map((s) => s.status.replace(/_/g, ' ')),
                SOW_STATUS_COUNTS.map((s) => s.count),
              )}
              options={baseBarOptions}
            />
          </ChartBlock>
          <ChartBlock label="Average time in each status (days)">
            <Bar
              data={singleSeriesBar(
                AVG_STATUS_DURATION.map((s) => s.transition),
                AVG_STATUS_DURATION.map((s) => s.avgDays),
              )}
              options={baseBarOptions}
            />
          </ChartBlock>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Stuck in Changes Requested
            </p>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
              {STUCK_THRESHOLDS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStuckThreshold(n)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    stuckThreshold === n
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  &gt; {n}d
                </button>
              ))}
            </div>
          </div>
          {stuckSows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No SOWs stuck beyond {stuckThreshold} days.
            </p>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border">
              {stuckSows.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{s.sowNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.title}</p>
                  </div>
                  <div className="shrink-0">
                    <Badge tone="warning">{s.daysInStatus}d</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section id="approval-health" title="Approval health" description="Load and outcomes across approvers and workflows.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartBlock label="Approval steps pending per approver">
            <Bar
              data={singleSeriesBar(
                APPROVER_PENDING.map((a) => a.approver),
                APPROVER_PENDING.map((a) => a.pending),
              )}
              options={baseBarOptions}
            />
          </ChartBlock>
          <ChartBlock label="Avg approval turnaround per workflow (days)">
            <Bar
              data={singleSeriesBar(
                WORKFLOW_TURNAROUND.map((w) => w.workflow),
                WORKFLOW_TURNAROUND.map((w) => w.avgDays),
              )}
              options={baseBarOptions}
            />
          </ChartBlock>
          <ChartBlock label="Rejection rate by workflow (%)">
            <Bar
              data={singleSeriesBar(
                WORKFLOW_REJECTION_RATE.map((w) => w.workflow),
                WORKFLOW_REJECTION_RATE.map((w) => w.rejectionRatePct),
              )}
              options={baseBarOptions}
            />
          </ChartBlock>
        </div>
      </Section>

      <Section id="team-management" title="Team management" description="Activity and staffing across roles.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartBlock label="Active vs. inactive users by role">
            <Bar
              data={{
                labels: ROLE_ACTIVITY.map((r) => r.role),
                datasets: [
                  {
                    label: 'Active',
                    data: ROLE_ACTIVITY.map((r) => r.active),
                    backgroundColor: CHART_COLORS.series1,
                    borderRadius: 4,
                    maxBarThickness: 28,
                  },
                  {
                    label: 'Inactive',
                    data: ROLE_ACTIVITY.map((r) => r.inactive),
                    backgroundColor: CHART_COLORS.series2,
                    borderRadius: 4,
                    maxBarThickness: 28,
                  },
                ],
              }}
              options={{
                ...baseBarOptions,
                plugins: { ...baseBarOptions.plugins, legend: { display: true, position: 'top' as const, labels: { boxWidth: 10, color: '#57657c', font: { size: 11 } } } },
              }}
            />
          </ChartBlock>
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Users with zero activity (30/60/90 days)
            </p>
            <div className="divide-y divide-border rounded-lg border border-border">
              {INACTIVE_USERS.map((u) => (
                <div key={u.email} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email} · {u.role}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Badge tone={u.lastActiveDaysAgo >= 90 ? 'danger' : u.lastActiveDaysAgo >= 60 ? 'warning' : 'neutral'}>
                      {u.lastActiveDaysAgo}d idle
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="template-workflow" title="Template & workflow usage" description="What's actually being used.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartBlock label="Template usage frequency (SOWs created)">
            <Bar
              data={singleSeriesBar(
                TEMPLATE_USAGE.map((t) => t.template),
                TEMPLATE_USAGE.map((t) => t.sowCount),
              )}
              options={baseBarOptions}
            />
          </ChartBlock>
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Workflows with no active SOWs
            </p>
            {IDLE_WORKFLOWS.length === 0 ? (
              <p className="text-sm text-muted-foreground">All workflows have active SOWs.</p>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {IDLE_WORKFLOWS.map((w) => (
                  <div key={w.workflow} className="flex items-center justify-between px-4 py-2.5">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{w.workflow}</p>
                    <div className="shrink-0">
                      <Badge tone="neutral">0 active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section id="projects-clients" title="Projects & clients" description="Where activity and value are concentrated.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartBlock label="Active projects per client">
            <Bar
              data={singleSeriesBar(
                CLIENT_PROJECT_COUNTS.map((c) => c.client),
                CLIENT_PROJECT_COUNTS.map((c) => c.activeProjects),
              )}
              options={baseBarOptions}
            />
          </ChartBlock>
          <ChartBlock label="SOW value by client ($)">
            <Bar
              data={singleSeriesBar(
                CLIENT_SOW_VALUE.map((c) => c.client),
                CLIENT_SOW_VALUE.map((c) => c.totalValue),
              )}
              options={{
                ...baseBarOptions,
                plugins: {
                  ...baseBarOptions.plugins,
                  tooltip: {
                    ...baseBarOptions.plugins?.tooltip,
                    callbacks: {
                      label: (ctx) => `$${Number(ctx.parsed.y ?? ctx.parsed).toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </ChartBlock>
        </div>
      </Section>

      <Section id="recent-audit" title="Recent audit changes" description="Latest activity across the organization.">
        <div className="divide-y divide-border">
          {RECENT_AUDIT_ENTRIES.map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                <span className="font-medium">{entry.actor}</span>{' '}
                <span className="text-muted-foreground">
                  {entry.action.replace(/_/g, ' ').toLowerCase()}
                </span>{' '}
                — {entry.entityId}
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">{entry.createdAt}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
