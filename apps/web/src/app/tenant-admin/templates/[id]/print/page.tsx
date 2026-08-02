import './print.css';
import { notFound } from 'next/navigation';
import { getTemplate } from '@/lib/data/templates';

export default async function TemplatePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getTemplate(id);
  if (!template) notFound();

  return (
    <article
      className="prose max-w-none p-8 print:p-0"
      dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
    />
  );
}
