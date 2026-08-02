'use client';

import Link from 'next/link';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import {
  ArrowRight,
  FileText,
  Gauge,
  History,
  Layers,
  ScrollText,
  Users,
  Workflow,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { SectionEyebrow } from '@/components/shared/section-eyebrow';
import { StatStrip } from '@/components/shared/stat-strip';
import { StatusStackBar } from '@/components/shared/status-stack-bar';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { auditLogs } from '@/lib/data/audit-logs';
import { sows, sowStatusLabels, type SowStatus } from '@/lib/data/sows';
import { users } from '@/lib/data/users';
import { workflowTemplates } from '@/lib/data/workflow-templates';
import { templates } from '@/lib/data/templates';

const approvalTimeData = [
  { month: 'Mar', days: 6 },
  { month: 'Apr', days: 5 },
  { month: 'May', days: 4.5 },
  { month: 'Jun', days: 3.8 },
  { month: 'Jul', days: 4.1 },
];

const approvalTimeConfig = {
  days: { label: 'Avg. days', color: 'var(--primary)' },
} satisfies ChartConfig;

export default function TenantAdminDashboard() {
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const activeTemplates = templates.filter((t) => t.status === 'active').length;
  const activeWorkflowTemplates = workflowTemplates.filter(
    (w) => w.status === 'active',
  ).length;

  const pipelineData = (Object.keys(sowStatusLabels) as SowStatus[])
    .filter((status) => status !== 'archived')
    .map((status) => ({
      key: status,
      status: sowStatusLabels[status],
      count: sows.filter((s) => s.status === status).length,
    }));

  const clientCount = new Set(sows.map((s) => s.clientId)).size;

  const firstApprovalTime = approvalTimeData[0].days;
  const lastApprovalTime = approvalTimeData[approvalTimeData.length - 1].days;
  const approvalTimeDelta = lastApprovalTime - firstApprovalTime;

  const recentActivity = auditLogs.slice(0, 6);
  const recentSows = [...sows]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Northwind Consulting — tenant overview."
      />

      <StatStrip
        items={[
          { label: 'Active users', value: activeUsers, icon: Users },
          { label: 'Active templates', value: activeTemplates, icon: FileText },
          {
            label: 'Active workflows',
            value: activeWorkflowTemplates,
            icon: Workflow,
          },
          { label: 'Total SOWs', value: sows.length, icon: ScrollText },
        ]}
      />

      <div className="mt-8 flex flex-col gap-10">
        <section>
          <SectionEyebrow
            icon={Layers}
            tint="var(--primary)"
            label="Pipeline"
            description={`${sows.length} SOWs across ${clientCount} client${clientCount === 1 ? '' : 's'}`}
          />
          <div className="rounded-lg border border-border p-4">
            <StatusStackBar data={pipelineData} total={sows.length} />
          </div>
        </section>

        <section>
          <SectionEyebrow
            icon={Gauge}
            tint="var(--primary)"
            label="Approval velocity"
            description={`Averaging ${lastApprovalTime.toFixed(1)} days to decision, ${
              approvalTimeDelta <= 0
                ? `down ${Math.abs(approvalTimeDelta).toFixed(1)}d`
                : `up ${approvalTimeDelta.toFixed(1)}d`
            } since March`}
          />
          <div className="rounded-lg border border-border p-4">
            <ChartContainer config={approvalTimeConfig} className="h-48 w-full">
              <LineChart data={approvalTimeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="days"
                  stroke="var(--color-days)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <SectionEyebrow
              icon={History}
              tint="var(--primary)"
              label="Recent activity"
              description="Latest actions across the tenant"
            />
            <ScrollArea className="h-72 pr-4">
              <ul className="relative flex flex-col gap-4 border-l border-border pl-6">
                {recentActivity.map((log) => (
                  <li key={log.id} className="relative flex items-start gap-3">
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
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <SectionEyebrow
                icon={ScrollText}
                tint="var(--primary)"
                label="Project progress"
                description="Most recently updated SOWs"
              />
            </div>
            <div className="-mt-4 overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SOW</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="max-w-0">
                        <Link
                          href={`/tenant-admin/sows/${s.id}`}
                          className="group flex items-center gap-2 hover:opacity-80"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {s.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {s.number} · {s.projectName}
                            </div>
                          </div>
                          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <SowStatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
