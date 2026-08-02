import './print.css';
import { notFound } from 'next/navigation';
import { getSow } from '@/lib/data/sows';
import { sowToHtml } from '@/lib/docx/sow-to-html';

export default async function SowPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sow = getSow(id);
  if (!sow) notFound();

  return (
    <article
      className="prose max-w-none p-8 print:p-0"
      dangerouslySetInnerHTML={{ __html: sowToHtml(sow) }}
    />
  );
}
