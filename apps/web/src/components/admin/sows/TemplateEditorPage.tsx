'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '../../ui/page-header';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input, Textarea } from '../../ui/input';
import { Label } from '../../ui/label';
import { TemplateBuilder } from './builder/TemplateBuilder';
import type { FieldDraft } from './builder/fieldTypes';
import { useTemplateStore, type SchemaOverride } from './templateStore';

export function TemplateEditorPage({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const templates = useTemplateStore((s) => s.templates);
  const upsertTemplate = useTemplateStore((s) => s.upsertTemplate);
  const editing = templateId ? templates.find((t) => t.id === templateId) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [fields, setFields] = useState<FieldDraft[]>(editing?.fields ?? []);
  const [schemaOverride, setSchemaOverride] = useState<SchemaOverride | null>(() => {
    const hasCustomSchema =
      editing &&
      editing.fields.length === 0 &&
      Object.keys(editing.jsonSchema.properties ?? {}).length > 0;
    return hasCustomSchema
      ? { jsonSchema: editing.jsonSchema, uiSchema: editing.uiSchema, defaultValues: editing.defaultValues }
      : null;
  });
  const [nameError, setNameError] = useState<string | null>(null);

  function goToList() {
    router.push('/tenantSlug/admin/sows');
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required.');
      return;
    }
    const duplicate = templates.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== editing?.id,
    );
    if (duplicate) {
      setNameError('A template with this name already exists in your organization.');
      return;
    }
    upsertTemplate({
      id: editing?.id,
      name: trimmed,
      description,
      fields,
      schemaOverride,
      isActive: editing?.isActive ?? true,
    });
    goToList();
  }

  return (
    <div>
      <PageHeader
        title={editing ? 'Edit template' : 'New template'}
        description="Build a JSON-Schema-driven form for this template."
        actions={
          <>
            <Button variant="ghost" onClick={goToList}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? 'Save changes' : 'Create template'}</Button>
          </>
        }
      />

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(null);
                }}
              />
              {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <TemplateBuilder
            fields={fields}
            onFieldsChange={setFields}
            schemaOverride={schemaOverride}
            onSchemaOverrideChange={setSchemaOverride}
          />
        </div>
      </div>
    </div>
  );
}
