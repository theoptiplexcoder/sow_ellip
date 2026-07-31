'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { EmptyState } from '../ui/table';
import { DocumentEditor } from '../admin/sows/document/DocumentEditor';
import { docToSchemaOverride, EMPTY_DOC } from '../admin/sows/document/docToSchema';
import { useTemplateStore } from '../admin/sows/templateStore';
import { useParticipantSowStore } from './participantSowStore';

export function SowEditorPage({ sowId }: { sowId: string }) {
  const router = useRouter();
  const sows = useParticipantSowStore((s) => s.sows);
  const saveNewVersion = useParticipantSowStore((s) => s.saveNewVersion);
  const templates = useTemplateStore((s) => s.templates);

  const sow = sows.find((s) => s.id === sowId);
  const template = sow ? templates.find((t) => t.id === sow.templateId) : undefined;

  const [body, setBody] = useState<JSONContent>(sow?.body ?? template?.body ?? EMPTY_DOC);

  function goToSows() {
    router.push('/tenantSlug/participant/sows/my');
  }

  function handleSave() {
    if (!sow) return;
    const schemaOverride = docToSchemaOverride(body);
    saveNewVersion(sow.id, {
      fields: sow.fields ?? [],
      schemaOverride,
      formData: schemaOverride.defaultValues,
      body,
    });
    goToSows();
  }

  if (!sow) {
    return (
      <div>
        <PageHeader title="SOW not found" />
        <Button variant="ghost" onClick={goToSows}>
          Back to SOWs
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${sow.sowNumber}`}
        description={sow.title}
        actions={
          <>
            <Button variant="ghost" onClick={goToSows}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save as new version</Button>
          </>
        }
      />

      {template ? (
        <div className="mt-6">
          <DocumentEditor content={body} onChange={setBody} />
        </div>
      ) : (
        <EmptyState message="No template linked to this SOW" />
      )}
    </div>
  );
}
