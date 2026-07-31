'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import { PageHeader } from '../../ui/page-header';
import { Button } from '../../ui/button';

import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { DocumentEditor } from './document/DocumentEditor';
import { docToSchemaOverride, EMPTY_DOC } from './document/docToSchema';
import { useTemplateStore } from './templateStore';

export function TemplateEditorPage({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const templates = useTemplateStore((s) => s.templates);
  const upsertTemplate = useTemplateStore((s) => s.upsertTemplate);
  const editing = templateId ? templates.find((t) => t.id === templateId) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [body, setBody] = useState<JSONContent>(editing?.body ?? EMPTY_DOC);
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
    const payload = {
      id: editing?.id,
      name: trimmed,
      description,
      fields: [],
      body,
      schemaOverride: docToSchemaOverride(body),
      isActive: editing?.isActive ?? true,
    };
    console.log('Template created/saved:', payload);
    upsertTemplate(payload);
    goToList();
  }

  return (
    <div>
      <PageHeader
        title={editing ? 'Edit template' : 'New template'}
        description="Type the template as a document; sections become form fields automatically."
        actions={
          <>
            <Button variant="ghost" onClick={goToList}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? 'Save changes' : 'Create template'}</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <Input
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <DocumentEditor content={body} onChange={setBody} />
      </div>
    </div>
  );
}
