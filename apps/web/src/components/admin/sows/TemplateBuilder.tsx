'use client';

import { useRef, useState } from 'react';

import { Printer } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { PrintHeader } from '../../ui/print-header';
import type { Step } from '@sow/workflows';
import { PMCanvas, type PMCanvasHandle } from './pm/PMCanvas';
import type { DocJSON } from './pm/docConvert';
import { PropertyPanel } from './PropertyPanel';
import { TemplateWorkflowPanel } from './TemplateWorkflowPanel';
import { getTemplateById, useTemplateStore } from './templateStore';
import { type FieldDraft } from './types';
import { EMPTY_DOC_JSON } from './pm/docConvert';

type TemplateBuilderProps = {
  templateId?: string;
};

export function TemplateBuilder({ templateId }: TemplateBuilderProps) {
  const upsertTemplate = useTemplateStore((s) => s.upsertTemplate);
  const existing = templateId ? getTemplateById(templateId) : undefined;

  const [name, setName] = useState(existing?.name ?? 'Untitled template');
  const [fields, setFields] = useState<FieldDraft[]>(existing?.fields ?? []);
  const [body, setBody] = useState<DocJSON>(existing?.body ?? EMPTY_DOC_JSON);
  const [workflowSteps, setWorkflowSteps] = useState<Step[]>(existing?.workflowSteps ?? []);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const canvasRef = useRef<PMCanvasHandle>(null);

  const selectedField = fields.find((f) => f.key === selectedKey) ?? null;

  function handleFieldChange(key: string, patch: Partial<FieldDraft>) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  function handleSave(publish: boolean) {
    const saved = upsertTemplate({
      id: existing?.id,
      name,
      fields,
      body,
      workflowSteps,
      isActive: publish,
    });
    setSavedAt(new Date().toLocaleTimeString());
    return saved;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-sm text-base font-semibold"
        />
        <div className="flex items-center gap-3 no-print">
          {savedAt && <span className="text-xs text-muted-foreground">Saved at {savedAt}</span>}
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)}>Save As Draft</Button>
          <Button onClick={() => handleSave(true)}>Publish</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6" data-print-area>
          <PrintHeader />
          <PMCanvas
            ref={canvasRef}
            body={body}
            fields={fields}
            onBodyChange={setBody}
            onSelectField={setSelectedKey}
          />
        </div>
        <div className="flex overflow-hidden">
          <PropertyPanel field={selectedField} fields={fields} onChange={handleFieldChange} />
          <TemplateWorkflowPanel steps={workflowSteps} onChange={setWorkflowSteps} />
        </div>
      </div>
    </div>
  );
}
