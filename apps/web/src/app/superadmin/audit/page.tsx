import { Badge } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { platformAuditEvents } from '@/lib/data/organizations';

export default function PlatformAuditPage() {
  return (
    <div>
      <PageHeader
        title="Platform Audit"
        description="Platform-level events only — Organization Created, Enabled/Disabled, Tenant Admin Assigned, Superadmin Login."
      />

      <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
        Event Timeline
      </h2>
      {platformAuditEvents.length > 0 ? (
        <ol className="flex flex-col gap-5 border-l pl-6">
          {platformAuditEvents.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[29px] top-1 size-2.5 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{event.event}</Badge>
                <span className="text-sm font-medium">{event.detail}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {event.actor} · {event.timestamp}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
          No platform-level events recorded yet.
        </div>
      )}
    </div>
  );
}
