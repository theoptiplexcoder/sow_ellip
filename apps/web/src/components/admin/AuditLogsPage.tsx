'use client';

import { useMemo, useState } from 'react';
import { Search, UserPlus, Zap, FileText, ShieldCheck, FolderKanban } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { EmptyState } from '../ui/table';

type EntityType = 'CLIENT' | 'PROJECT' | 'TEMPLATE' | 'WORKFLOW' | 'SOW' | 'USER';

type AuditLogRow = {
  id: string;
  actor: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  createdAt: string;
};

const ENTITY_LABEL: Record<EntityType, string> = {
  CLIENT: 'Client',
  PROJECT: 'Project',
  TEMPLATE: 'Template',
  WORKFLOW: 'Workflow',
  SOW: 'SOW',
  USER: 'User',
};

const ENTITY_ICON: Record<EntityType, typeof UserPlus> = {
  CLIENT: FolderKanban,
  PROJECT: FolderKanban,
  TEMPLATE: FileText,
  WORKFLOW: Zap,
  SOW: ShieldCheck,
  USER: UserPlus,
};

const ENTITY_COLOR: Record<EntityType, string> = {
  CLIENT: 'bg-blue-100 text-blue-700',
  PROJECT: 'bg-purple-100 text-purple-700',
  TEMPLATE: 'bg-amber-100 text-amber-700',
  WORKFLOW: 'bg-emerald-100 text-emerald-700',
  SOW: 'bg-rose-100 text-rose-700',
  USER: 'bg-gray-100 text-gray-600',
};

const LOGS: AuditLogRow[] = [
  { id: 'a-1', actor: 'Priya Nair', action: 'USER_INVITED', entityType: 'USER', entityId: 'jordan@acme.com', createdAt: '2026-07-26 09:12' },
  { id: 'a-2', actor: 'Sam Okafor', action: 'WORKFLOW_ACTIVATED', entityType: 'WORKFLOW', entityId: 'Standard 2-step', createdAt: '2026-07-25 14:03' },
  { id: 'a-3', actor: 'Priya Nair', action: 'TEMPLATE_ARCHIVED', entityType: 'TEMPLATE', entityId: 'Retainer v1', createdAt: '2026-07-24 11:47' },
  { id: 'a-4', actor: 'Dana Wu', action: 'SOW_APPROVED', entityType: 'SOW', entityId: 'SOW-1042', createdAt: '2026-07-20 16:30' },
  { id: 'a-5', actor: 'Sam Okafor', action: 'CLIENT_CREATED', entityType: 'CLIENT', entityId: 'Initech', createdAt: '2026-07-11 08:55' },
  { id: 'a-6', actor: 'Priya Nair', action: 'PROJECT_UPDATED', entityType: 'PROJECT', entityId: 'Data migration', createdAt: '2026-07-10 10:20' },
];

const ENTITY_FILTERS: { label: string; value: 'ALL' | EntityType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Users', value: 'USER' },
  { label: 'SOWs', value: 'SOW' },
  { label: 'Workflows', value: 'WORKFLOW' },
  { label: 'Templates', value: 'TEMPLATE' },
  { label: 'Clients', value: 'CLIENT' },
  { label: 'Projects', value: 'PROJECT' },
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const ACTOR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
];

function actorColor(name: string) {
  const index = name.charCodeAt(0) % ACTOR_COLORS.length;
  return ACTOR_COLORS[index];
}

function formatAction(action: string) {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuditLogsPage() {
  const [entityFilter, setEntityFilter] = useState<'ALL' | EntityType>('ALL');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const visible = useMemo(() => {
    return LOGS.filter((log) => {
      if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
      if (
        search &&
        !log.actor.toLowerCase().includes(search.toLowerCase()) &&
        !log.action.toLowerCase().includes(search.toLowerCase()) &&
        !log.entityId.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      const date = log.createdAt.slice(0, 10);
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });
  }, [entityFilter, search, from, to]);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Append-only record of activity in your organization."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by actor, action, or entity..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
          {ENTITY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setEntityFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                entityFilter === f.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <Label className="mb-1 text-xs" htmlFor="from-date">From</Label>
            <Input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-28 sm:w-36" />
          </div>
          <div>
            <Label className="mb-1 text-xs" htmlFor="to-date">To</Label>
            <Input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-28 sm:w-36" />
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState message="No audit events match these filters" />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {visible.map((log) => {
              const Icon = ENTITY_ICON[log.entityType];
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${actorColor(log.actor)}`}>
                    {getInitials(log.actor)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{log.actor}</span>{' '}
                      <span className="text-muted-foreground">{formatAction(log.action)}</span>
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className={`flex h-4 w-4 items-center justify-center rounded ${ENTITY_COLOR[log.entityType]}`}>
                        <Icon className="h-2.5 w-2.5" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {ENTITY_LABEL[log.entityType]} — {log.entityId}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {log.createdAt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
