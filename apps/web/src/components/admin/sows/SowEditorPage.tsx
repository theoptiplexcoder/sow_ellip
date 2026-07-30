'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../ui/page-header';
import { Button } from '../../ui/button';
import { EmptyState } from '../../ui/table';
import { TemplateBuilder } from './builder/TemplateBuilder';
import type { FieldDraft } from './builder/fieldTypes';
import { useTemplateStore, type SchemaOverride } from './templateStore';
import { useSowStore } from './sowStore';

export function SowEditorPage({ sowId }: { sowId: string }) {
  const router = useRouter();
  const sows = useSowStore((s) => s.sows);
  const saveNewVersion = useSowStore((s) => s.saveNewVersion);
  const templates = useTemplateStore((s) => s.templates);

  const sow = sows.find((s) => s.id === sowId);
  const template = sow ? templates.find((t) => t.id === sow.templateId) : undefined;

  const [fields, setFields] = useState<FieldDraft[]>(sow?.fields ?? template?.fields ?? []);
  const [schemaOverride, setSchemaOverride] = useState<SchemaOverride | null>(sow?.schemaOverride ?? null);
  const [formData, setFormData] = useState<Record<string, unknown>>(sow?.formData ?? template?.defaultValues ?? {});

  function goToSows() {
    router.push('/tenantSlug/admin/sows');
  }

  function handleSave() {
    if (!sow) return;
    saveNewVersion(sow.id, { fields, schemaOverride, formData });
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
        <TemplateBuilder
          fields={fields}
          onFieldsChange={setFields}
          schemaOverride={schemaOverride}
          onSchemaOverrideChange={setSchemaOverride}
          version={sow.version}
          formData={formData}
          onFormDataChange={setFormData}
        />
      ) : (
        <EmptyState message="No template linked to this SOW" />
      )}
    </div>
  );
}
