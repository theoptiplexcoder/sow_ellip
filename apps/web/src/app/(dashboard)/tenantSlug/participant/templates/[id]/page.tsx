import { TemplateFillPage } from '../../../../../../components/participant/TemplateFillPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TemplateFillPage templateId={id} />;
}
