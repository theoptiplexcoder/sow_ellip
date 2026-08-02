import { Avatar, AvatarFallback, Badge } from '@sow-platform/ui';
import { History } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { auditLogs } from '@/lib/data/audit-logs';

export default function ActivityPage() {
  return (
    <div>
      <PageHeader
        title="Activity"
        description="Recent activity across your assigned projects."
      />

      {auditLogs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <History className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No activity yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Actions taken across your assigned projects will show up here.
          </p>
        </div>
      ) : (
        <ul className="relative flex flex-col gap-6 border-l border-border pl-6">
          {auditLogs.map((log) => (
            <li key={log.id} className="relative flex items-start gap-3">
              <span className="absolute top-1 -left-[29px] size-2.5 rounded-full border-2 border-background bg-muted-foreground" />
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {log.actor
                    .split(' ')
                    .map((p) => p[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <span className="font-medium">{log.actor}</span>{' '}
                <span className="text-muted-foreground">{log.action}</span>{' '}
                <span className="font-medium">{log.entityName}</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {log.entityType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {log.timestamp}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
