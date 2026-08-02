'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from 'recharts';
import { Building2, CircleCheck, CirclePause } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { organizationGrowth, organizations } from '@/lib/data/organizations';

const growthConfig = {
  organizations: { label: 'Organizations', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const statusConfig = {
  active: { label: 'Active', color: 'var(--chart-1)' },
  disabled: { label: 'Disabled', color: 'var(--chart-4)' },
} satisfies ChartConfig;

export default function PlatformAnalyticsPage() {
  const activeCount = organizations.filter((o) => o.status === 'active').length;
  const disabledCount = organizations.filter(
    (o) => o.status === 'disabled',
  ).length;
  const statusData = [
    { status: 'active', count: activeCount, fill: 'var(--chart-1)' },
    { status: 'disabled', count: disabledCount, fill: 'var(--chart-4)' },
  ];

  return (
    <div>
      <PageHeader
        title="Platform Analytics"
        description="Organization growth and status trends across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Tenants"
          value={organizations.length}
          icon={Building2}
        />
        <StatCard
          label="Active Tenants"
          value={activeCount}
          icon={CircleCheck}
        />
        <StatCard
          label="Disabled Tenants"
          value={disabledCount}
          icon={CirclePause}
        />
      </div>

      <h2 className="mt-8 mb-4 font-display text-lg font-semibold tracking-tight">
        Growth &amp; Status Trends
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Organizations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="h-64 w-full">
              <LineChart data={organizationGrowth}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="organizations"
                  stroke="var(--color-organizations)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enabled vs. Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={45}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Organizations Growth (cumulative)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="h-64 w-full">
              <BarChart data={organizationGrowth}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="organizations"
                  fill="var(--color-organizations)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
