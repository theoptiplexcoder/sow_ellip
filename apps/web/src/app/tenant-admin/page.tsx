'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { FileText, ScrollText, Users, Workflow } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ScrollArea,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { auditLogs } from '@/lib/data/audit-logs';
import { sows } from '@/lib/data/sows';
import { users } from '@/lib/data/users';
import { workflowTemplates } from '@/lib/data/workflow-templates';
import { templates } from '@/lib/data/templates';

const sowStatusData = [
  { status: 'Draft', count: sows.filter((s) => s.status === 'draft').length },
  {
    status: 'Submitted',
    count: sows.filter((s) => s.status === 'submitted').length,
  },
  {
    status: 'In Review',
    count: sows.filter((s) => s.status === 'in_review').length,
  },
  {
    status: 'Approved',
    count: sows.filter((s) => s.status === 'approved').length,
  },
  {
    status: 'Rejected',
    count: sows.filter((s) => s.status === 'rejected').length,
  },
];

const approvalTimeData = [
  { month: 'Mar', days: 6 },
  { month: 'Apr', days: 5 },
  { month: 'May', days: 4.5 },
  { month: 'Jun', days: 3.8 },
  { month: 'Jul', days: 4.1 },
];

const sowStatusConfig = {
  count: { label: 'SOWs', color: 'var(--chart-1)' },
} satisfies ChartConfig;
const approvalTimeConfig = {
  days: { label: 'Avg. days', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export default function TenantAdminDashboard() {
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const activeTemplates = templates.filter((t) => t.status === 'active').length;
  const activeWorkflowTemplates = workflowTemplates.filter(
    (w) => w.status === 'active',
  ).length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Northwind Consulting — tenant overview."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Users" value={activeUsers} icon={Users} />
        <StatCard
          label="Active Templates"
          value={activeTemplates}
          icon={FileText}
        />
        <StatCard
          label="Active Workflow Templates"
          value={activeWorkflowTemplates}
          icon={Workflow}
        />
        <StatCard
          label="Status Summary"
          value={`${sows.length} SOWs`}
          icon={ScrollText}
          hint="Across all projects"
        />
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold tracking-tight">
        Analytics
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SOW Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sowStatusConfig} className="h-56 w-full">
              <BarChart data={sowStatusData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approval Time (avg. days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={approvalTimeConfig} className="h-56 w-full">
              <LineChart data={approvalTimeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="days"
                  stroke="var(--color-days)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold tracking-tight">
        Activity
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 pr-4">
              <ul className="flex flex-col gap-3">
                {auditLogs.slice(0, 6).map((log) => (
                  <li key={log.id} className="flex items-start gap-3">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {sows.slice(0, 5).map((sow) => (
                <li
                  key={sow.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{sow.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {sow.projectName}
                    </div>
                  </div>
                  <SowStatusBadge status={sow.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
