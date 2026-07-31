'use client';

import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import type { FieldDraft } from './types';

type PropertyPanelProps = {
  field: FieldDraft | null;
  fields: FieldDraft[];
  onChange: (key: string, patch: Partial<FieldDraft>) => void;
};

const CONTAINER_KINDS: FieldDraft['kind'][] = ['object', 'array', 'dynamicTable'];

export function PropertyPanel({ field, fields, onChange }: PropertyPanelProps) {
  if (!field) {
    return null;
  }

  const isContainer = CONTAINER_KINDS.includes(field.kind);
  const candidateChildren = isContainer ? fields.filter((f) => f.key !== field.key) : [];

  return (
    <div className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border p-4">
      <div>
        <Label htmlFor="field-title">Label</Label>
        <Input
          id="field-title"
          value={field.title}
          onChange={(e) => onChange(field.key, { title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="field-key">Field name</Label>
        <Input id="field-key" value={field.key} disabled />
      </div>

      <div>
        <Label htmlFor="field-placeholder">Placeholder</Label>
        <Input
          id="field-placeholder"
          value={field.placeholder ?? ''}
          onChange={(e) => onChange(field.key, { placeholder: e.target.value })}
        />
      </div>

      <Checkbox
        checked={field.required}
        onCheckedChange={(checked) => onChange(field.key, { required: checked })}
        label="Required"
      />

      <Checkbox
        checked={field.readOnly}
        onCheckedChange={(checked) => onChange(field.key, { readOnly: checked })}
        label="Read only"
      />

      {isContainer && (
        <div>
          <Label>Child fields</Label>
          <div className="flex flex-col gap-1.5 rounded-md border border-border p-2">
            {candidateChildren.length === 0 && (
              <span className="text-xs text-muted-foreground">No other fields yet.</span>
            )}
            {candidateChildren.map((child) => (
              <Checkbox
                key={child.key}
                checked={child.parentKey === field.key}
                onCheckedChange={(checked) => onChange(child.key, { parentKey: checked ? field.key : undefined })}
                label={child.title || child.key}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
