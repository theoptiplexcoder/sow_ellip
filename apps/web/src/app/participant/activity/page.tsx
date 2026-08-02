import { History } from 'lucide-react';
import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { EmptyState } from '@/components/shared/empty-state';
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
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Actions taken across your assigned projects will show up here."
        />
      ) : (
        <ActivityTimeline
          items={auditLogs}
          getKey={(log) => log.id}
          getActor={(log) => log.actor}
          getAction={(log) => log.action}
          getEntityName={(log) => log.entityName}
          getTimestamp={(log) => log.timestamp}
          getEntityType={(log) => log.entityType}
          className="gap-6"
        />
      )}
    </div>
  );
}
