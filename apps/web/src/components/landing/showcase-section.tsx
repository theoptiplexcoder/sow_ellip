'use client';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
} from '@sow-platform/ui';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  User,
} from 'lucide-react';
import { Reveal } from './reveal';

const KANBAN = [
  { stage: 'Draft', items: ['Cloud Migration SOW', 'Q3 Marketing Retainer'] },
  {
    stage: 'In Review',
    items: ['Enterprise Rollout — Phase 2', 'API Integration Scope'],
  },
  { stage: 'Client Review', items: ['Data Warehouse Build'] },
  { stage: 'Signed', items: ['Brand Refresh 2026', 'Support Retainer — Q1'] },
];

const APPROVALS = [
  {
    name: 'Enterprise Rollout — Phase 2',
    owner: 'Sarah Chen',
    status: 'Awaiting Legal',
    tone: 'amber',
  },
  {
    name: 'Data Warehouse Build',
    owner: 'Marcus Lee',
    status: 'Awaiting Client',
    tone: 'indigo',
  },
  {
    name: 'API Integration Scope',
    owner: 'Priya Nair',
    status: 'Approved',
    tone: 'emerald',
  },
];

export function ShowcaseSection() {
  return (
    <section id="showcase" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
            Inside the workspace
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Software that feels as good as it looks
          </h2>
          <p className="mt-4 text-foreground/60">
            A single pane of glass for every SOW, at every stage.
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-14 overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-xl"
        >
          <Tabs defaultValue="kanban" className="gap-0">
            <div className="overflow-x-auto border-b border-foreground/10 px-4 py-3">
              <TabsList variant="line" className="w-max gap-1">
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="queue">Approval Queue</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="portal">Client Portal</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="kanban" className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {KANBAN.map((col) => (
                  <div
                    key={col.stage}
                    className="rounded-xl bg-foreground/[0.025] p-3"
                  >
                    <p className="px-1 text-xs font-medium text-foreground/45">
                      {col.stage}
                    </p>
                    <div className="mt-2 space-y-2">
                      {col.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-foreground/10 bg-card p-3 text-xs font-medium shadow-sm transition-transform hover:-translate-y-0.5"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="queue" className="p-5 sm:p-6">
              <div className="space-y-2">
                {APPROVALS.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                        <User className="size-3.5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{row.name}</p>
                        <p className="text-xs text-foreground/45">
                          {row.owner}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${
                        row.tone === 'amber'
                          ? 'border-amber-500/30 text-amber-600 dark:text-amber-300'
                          : row.tone === 'emerald'
                            ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                            : 'border-indigo-500/30 text-indigo-600 dark:text-indigo-300'
                      }`}
                    >
                      {row.tone === 'emerald' ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                      {row.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Avg. approval time',
                    value: '2.1 days',
                    delta: '-38%',
                  },
                  { label: 'Completion rate', value: '96%', delta: '+12%' },
                  { label: 'Active SOWs', value: '184', delta: '+24' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4"
                  >
                    <p className="text-xs text-foreground/45">{stat.label}</p>
                    <div className="mt-1 flex items-end justify-between">
                      <p className="font-display text-2xl font-semibold">
                        {stat.value}
                      </p>
                      <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                        <TrendingUp className="size-3" />
                        {stat.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex h-28 items-end gap-1.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
                {[40, 55, 48, 70, 62, 80, 74, 90, 84, 96].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500/40 to-blue-400/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="portal" className="p-5 sm:p-6">
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Northwind Corp — Client Portal
                  </p>
                  <Badge className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                    Live
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    'Enterprise Rollout — Phase 2',
                    'Support Retainer — Q1',
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5 text-sm"
                    >
                      <span>{doc}</span>
                      <MessageSquare className="size-3.5 text-foreground/40" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
