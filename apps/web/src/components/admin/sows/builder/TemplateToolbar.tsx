'use client';

import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { FieldDraft } from './types';
import type { SchemaOverride } from '../templateStore';

export function TemplateToolbar({
  fields,
  schemaOverride,
  version,
  onImportFields,
  onImportSchema,
}: {
  fields: FieldDraft[];
  schemaOverride: SchemaOverride | null;
  version: number;
  onImportFields: (fields: FieldDraft[]) => void;
  onImportSchema: (override: SchemaOverride) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const payload = schemaOverride ? { schemaOverride } : { fields };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sow-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (Array.isArray(parsed.fields)) onImportFields(parsed.fields as FieldDraft[]);
      else if (parsed.schemaOverride?.jsonSchema) onImportSchema(parsed.schemaOverride as SchemaOverride);
      else if (parsed.jsonSchema) onImportSchema(parsed as SchemaOverride);
    } catch {
      // Malformed file — silently ignored, matches the JSON Schema tab's own inline validation.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Version {version}</span>
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
        <Button type="button" variant="outline" size="sm" onClick={handleImportClick}>
          <Upload className="h-3.5 w-3.5" />
          Import JSON
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Export JSON
        </Button>
      </div>
    </div>
  );
}
