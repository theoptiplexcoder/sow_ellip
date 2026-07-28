import { TemplateEditorPage } from '../../../../../../../components/admin/sows/TemplateEditorPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TemplateEditorPage templateId={id} />;
}
