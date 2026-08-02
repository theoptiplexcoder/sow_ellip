import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SectionEyebrow } from '@/components/shared/section-eyebrow';
import { SowCommentsPanel } from '@/components/shared/sow-comments-panel';
import { SowStateStrip } from '@/components/shared/sow-state-strip';
import { SowDocumentViewer } from '@/components/participant/sow-document-viewer';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectIdsForClientContact } from '@/lib/data/client-access';
import { getSow } from '@/lib/data/sows';
import { MessageSquare } from 'lucide-react';

export default async function ClientSowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sow = getSow(id);
  const linkedProjectIds = getProjectIdsForClientContact(
    currentUsers.client.id,
  );

  if (
    !sow ||
    sow.status === 'draft' ||
    !linkedProjectIds.includes(sow.projectId)
  ) {
    notFound();
  }

  return (
    <div>
      <PageHeader title={sow.title} description={sow.number} />
      <div className="mb-4">
        <SowStateStrip status={sow.status} />
      </div>
      <div className="flex flex-col gap-8">
        <SowDocumentViewer sow={sow} />

        <section>
          <SectionEyebrow
            icon={MessageSquare}
            tint="var(--status-pending)"
            label="Comments"
            description="Shared thread with the project team"
          />
          <SowCommentsPanel
            sowId={sow.id}
            currentAuthor={{
              id: currentUsers.client.id,
              name: currentUsers.client.name,
              type: 'client',
            }}
            canComment
          />
        </section>
      </div>
    </div>
  );
}
