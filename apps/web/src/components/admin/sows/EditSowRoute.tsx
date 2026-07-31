'use client';

import { useSearchParams } from 'next/navigation';
import { TemplateEditorPage } from './TemplateEditorPage';

export function EditSowRoute() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id') ?? '';
  return <TemplateEditorPage templateId={templateId} />;
}
