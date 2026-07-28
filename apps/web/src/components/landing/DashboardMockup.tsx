import { CheckCircle2, AlertTriangle, FileText, Search } from 'lucide-react';

const TAGS: Record<string, string> = {
  RETAINER: 'bg-blue-50 text-blue-700',
  ONBOARDING: 'bg-purple-50 text-purple-700',
  MIGRATION: 'bg-amber-50 text-amber-700',
};

const ROWS = [
  {
    name: 'Client Onboarding \u2014 Phase 2',
    tag: 'ONBOARDING',
    status: 'Approved',
    icon: CheckCircle2,
    tone: 'text-emerald-600',
    initials: 'JC',
  },
  {
    name: 'Q3 Infrastructure Retainer',
    tag: 'RETAINER',
    status: 'Scope change flagged',
    icon: AlertTriangle,
    tone: 'text-amber-600',
    initials: 'MR',
  },
  {
    name: 'Data Migration \u2014 Statement 04',
    tag: 'MIGRATION',
    status: 'Draft',
    icon: FileText,
    tone: 'text-muted-foreground',
    initials: 'AK',
  },
];

export function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/[0.03]">
      <div className="rounded-xl border border-border bg-muted/30">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/60" />
          <span className="ml-3 text-xs font-medium text-muted-foreground">
            Statements of Work
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
            <Search className="h-3 w-3" />
            Search
          </span>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-medium text-muted-foreground">
            Clients <span className="mx-1 text-border">/</span>{' '}
            <span className="text-foreground">Meridian Health</span>
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-accent px-3 py-2">
            <span className="text-xs font-semibold text-accent-foreground">
              Active statements (3)
            </span>
            <span className="rounded-md bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              This quarter
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {ROWS.map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${TAGS[row.tag]}`}
                >
                  {row.tag}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {row.name}
                </span>
                <span className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${row.tone}`}>
                  <row.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{row.status}</span>
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {row.initials}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {['Draft', 'Route', 'Approve'].map((step, i) => (
              <div key={step} className="rounded-lg bg-muted p-3">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Step {i + 1}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
