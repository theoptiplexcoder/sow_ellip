'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Canvas } from './Canvas';
import { FieldPalette } from './FieldPalette';
import { LivePreview } from './LivePreview';
import { PropertyPanel } from './PropertyPanel';
import { TemplateToolbar } from './TemplateToolbar';
import { buildObjectSchema, collectKeys, draftsToDefaultValues, newField, type FieldDraft, type FieldKind } from './fieldTypes';
import { getNodeAtPath, insertNodeAtParentPath, updateNodeAtPath } from './treeOps';
import type { SchemaOverride } from '../templateStore';

export function TemplateBuilder({
  fields,
  onFieldsChange,
  schemaOverride,
  onSchemaOverrideChange,
  version,
  formData,
  onFormDataChange,
}: {
  fields: FieldDraft[];
  onFieldsChange: (fields: FieldDraft[]) => void;
  schemaOverride: SchemaOverride | null;
  onSchemaOverrideChange: (override: SchemaOverride | null) => void;
  version: number;
  formData?: Record<string, unknown>;
  onFormDataChange?: (formData: Record<string, unknown>) => void;
}) {
  const [selectedPath, setSelectedPath] = useState<number[] | null>(null);

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

  function addFieldFromPalette(kind: FieldKind) {
    const node = newField(collectKeys(fields), kind);
    if (selectedPath) {
      const selected = getNodeAtPath(fields, selectedPath);
      if (selected?.children) {
        handleFieldsChange(insertNodeAtParentPath(fields, selectedPath, selected.children.length, node));
        return;
      }
      const parentPath = selectedPath.slice(0, -1);
      const index = selectedPath[selectedPath.length - 1];
      handleFieldsChange(insertNodeAtParentPath(fields, parentPath, index + 1, node));
      return;
    }
    handleFieldsChange([...fields, node]);
  }

  const selectedField = selectedPath ? getNodeAtPath(fields, selectedPath) : undefined;

  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="fields">Fields</TabsTrigger>
        <TabsTrigger value="schema">JSON Schema</TabsTrigger>
        <TabsTrigger value="preview">Live preview</TabsTrigger>
      </TabsList>

      <TabsContent value="fields">
        <div className="mb-3">
          <TemplateToolbar
            fields={fields}
            schemaOverride={schemaOverride}
            version={version}
            onImportFields={handleFieldsChange}
            onImportSchema={onSchemaOverrideChange}
          />
        </div>

        {schemaOverride ? (
          <p className="mb-3 text-sm text-muted-foreground">
            This template is currently defined by a custom JSON Schema. Editing fields here will
            replace it with a schema generated from these fields.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[15rem_1fr_18rem]">
          <div className="rounded-md border border-border p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Field palette</h3>
            <FieldPalette onAdd={addFieldFromPalette} />
          </div>

          <div className="min-w-0 rounded-md border border-border p-3" onClick={() => setSelectedPath(null)}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Canvas</h3>
            <Canvas fields={fields} onFieldsChange={handleFieldsChange} selectedPath={selectedPath} onSelect={setSelectedPath} />
          </div>

          <div className="rounded-md border border-border p-3">
            {selectedField && selectedPath ? (
              <PropertyPanel
                field={selectedField}
                allFields={fields}
                onChange={(patch) => handleFieldsChange(updateNodeAtPath(fields, selectedPath, patch))}
                onClose={() => setSelectedPath(null)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a field on the canvas to edit its properties.</p>
            )}
          </div>
        </div>
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
          defaultValues={formData ?? active.defaultValues}
          onFormDataChange={onFormDataChange}
        />
      </TabsContent>
    </Tabs>
  );
}
