import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ParticipantSowDetail } from '@/components/participant/participant-sow-detail';
import { getSow } from '@/lib/data/sows';

export default async function MySowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sow = getSow(id);
  if (!sow) notFound();

  return (
    <div>
      <Link
        href="/participant/my-sows"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to My SOWs
      </Link>
      <PageHeader
        title={`${sow.number} — ${sow.title}`}
        description={`${sow.clientName} · ${sow.projectName}`}
      />
      <ParticipantSowDetail
        sow={sow}
        showConflictBanner={sow.id === 'sow-1039'}
      />
    </div>
  );
}
