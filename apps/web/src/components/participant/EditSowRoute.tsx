'use client';

import { useSearchParams } from 'next/navigation';
import { SowEditorPage } from './SowEditorPage';

export function EditSowRoute() {
  const searchParams = useSearchParams();
  const sowId = searchParams.get('id') ?? '';
  return <SowEditorPage sowId={sowId} />;
}
