'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { FieldEditor } from './FieldEditor';
import { LivePreview } from './LivePreview';
import { buildObjectSchema, draftsToDefaultValues, type FieldDraft } from './fieldTypes';
import type { SchemaOverride } from '../templateStore';

export function TemplateBuilder({
  fields,
  onFieldsChange,
  schemaOverride,
  onSchemaOverrideChange,
}: {
  fields: FieldDraft[];
  onFieldsChange: (fields: FieldDraft[]) => void;
  schemaOverride: SchemaOverride | null;
  onSchemaOverrideChange: (override: SchemaOverride | null) => void;
}) {
  const derived = buildObjectSchema(fields);
  const active: SchemaOverride = schemaOverride ?? {
    jsonSchema: derived.schema,
    uiSchema: derived.uiSchema,
    defaultValues: draftsToDefaultValues(fields),
  };

  const [schemaText, setSchemaText] = useState(() => JSON.stringify(active, null, 2));
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Keep the schema text in sync with the Fields tab as long as the admin
  // hasn't taken over authoring the schema directly.
  useEffect(() => {
    if (!schemaOverride) {
      setSchemaText(JSON.stringify(active, null, 2));
      setSchemaError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, schemaOverride]);

  function handleFieldsChange(next: FieldDraft[]) {
    if (schemaOverride) onSchemaOverrideChange(null);
    onFieldsChange(next);
  }

  function handleSchemaTextChange(text: string) {
    setSchemaText(text);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setSchemaError('Invalid JSON.');
      return;
    }
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('jsonSchema' in parsed) ||
      typeof (parsed as { jsonSchema?: unknown }).jsonSchema !== 'object'
    ) {
      setSchemaError('Expected an object with a "jsonSchema" property.');
      return;
    }
    setSchemaError(null);
    const value = parsed as Partial<SchemaOverride>;
    onSchemaOverrideChange({
      jsonSchema: value.jsonSchema as SchemaOverride['jsonSchema'],
      uiSchema: (value.uiSchema as SchemaOverride['uiSchema']) ?? {},
      defaultValues: value.defaultValues ?? {},
    });
  }

  return (
    <Tabs defaultValue="fields">
      <TabsList>
        <TabsTrigger value="fields">Fields</TabsTrigger>
        <TabsTrigger value="schema">JSON Schema</TabsTrigger>
        <TabsTrigger value="preview">Live preview</TabsTrigger>
      </TabsList>

      <TabsContent value="fields">
        {fields.length === 0 && !schemaOverride ? (
          <p className="mb-3 text-sm text-muted-foreground">
            No fields yet. Add your first field to start building this template, or switch to the
            &quot;JSON Schema&quot; tab to paste one directly.
          </p>
        ) : null}
        {schemaOverride ? (
          <p className="mb-3 text-sm text-muted-foreground">
            This template is currently defined by a custom JSON Schema. Editing fields here will
            replace it with a schema generated from these fields.
          </p>
        ) : null}
        <FieldEditor fields={fields} onChange={handleFieldsChange} />
      </TabsContent>

      <TabsContent value="schema">
        <p className="mb-2 text-sm text-muted-foreground">
          Paste or edit a JSON Schema directly to define this template (
          <code>{'{ jsonSchema, uiSchema, defaultValues }'}</code>). Editing here takes over from
          the Fields tab.
        </p>
        <textarea
          value={schemaText}
          onChange={(e) => handleSchemaTextChange(e.target.value)}
          spellCheck={false}
          className="max-h-[32rem] min-h-[16rem] w-full overflow-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs text-foreground"
        />
        {schemaError && <p className="mt-1 text-xs text-red-600">{schemaError}</p>}
      </TabsContent>

      <TabsContent value="preview">
        <LivePreview
          schema={active.jsonSchema}
          uiSchema={active.uiSchema}
          defaultValues={active.defaultValues}
        />
      </TabsContent>
    </Tabs>
  );
}
