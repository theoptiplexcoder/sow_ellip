import {
  Building2,
  CircleCheck,
  CirclePause,
  LogIn,
  ScrollText,
  UserPlus,
} from 'lucide-react';
import { Badge } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { SectionEyebrow } from '@/components/shared/section-eyebrow';
import { platformAuditEvents } from '@/lib/data/organizations';

const eventMeta: Record<string, { icon: typeof Building2; className: string }> =
  {
    'Organization Created': { icon: Building2, className: 'text-primary' },
    'Organization Enabled': {
      icon: CircleCheck,
      className: 'text-status-approved',
    },
    'Organization Disabled': {
      icon: CirclePause,
      className: 'text-status-rejected',
    },
    'Tenant Admin Assigned': { icon: UserPlus, className: 'text-primary' },
    'Superadmin Login': { icon: LogIn, className: 'text-muted-foreground' },
  };

export default function PlatformAuditPage() {
  return (
    <div>
      <PageHeader
        title="Platform Audit"
        description="Platform-level events only — Organization Created, Enabled/Disabled, Tenant Admin Assigned, Superadmin Login."
      />

      <SectionEyebrow
        icon={ScrollText}
        tint="var(--primary)"
        label="Event timeline"
        description={`${platformAuditEvents.length} recorded event${platformAuditEvents.length === 1 ? '' : 's'}`}
      />

      {platformAuditEvents.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {platformAuditEvents.map((event) => {
            const meta = eventMeta[event.event] ?? {
              icon: ScrollText,
              className: 'text-muted-foreground',
            };
            const Icon = meta.icon;
            return (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent ${meta.className}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{event.event}</Badge>
                    <span className="text-sm font-medium">{event.detail}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {event.actor} · {event.timestamp}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
          No platform-level events recorded yet.
        </div>
      )}
    </div>
  );
}
