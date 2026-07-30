'use client';

import { X } from 'lucide-react';
import { Input, Textarea } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';
import { FormulaEditor } from './FormulaEditor';
import { ValidationEditor } from './ValidationEditor';
import {
  KINDS_WITH_OPTIONS,
  METADATA_KINDS,
  flattenFieldRefs,
  type FieldDraft,
  type FieldWidth,
} from './types';

const WIDTH_OPTIONS: { value: FieldWidth; label: string }[] = [
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '100', label: '100%' },
];

const CONTAINER_ITEM_KINDS = [
  'text', 'textarea', 'number', 'date', 'currency', 'percentage', 'select', 'checkbox', 'object',
] as const;

export function PropertyPanel({
  field,
  allFields,
  onChange,
  onClose,
}: {
  field: FieldDraft;
  allFields: FieldDraft[];
  onChange: (patch: Partial<FieldDraft>) => void;
  onClose: () => void;
}) {
  const isMetadata = METADATA_KINDS.includes(field.kind);
  const isArrayLike = field.kind === 'array' || field.kind === 'dynamicTable';
  const fieldRefs = flattenFieldRefs(allFields).filter((f) => f.key !== field.key);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Field properties</h3>
        <button type="button" aria-label="Close properties" className="rounded p-1 text-muted-foreground hover:bg-accent" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <section className="space-y-3">
        <div>
          <Label htmlFor="prop-title">Label</Label>
          <Input id="prop-title" value={field.title} onChange={(e) => onChange({ title: e.target.value })} />
        </div>

        {!isMetadata && (
          <div>
            <Label htmlFor="prop-key">Field key</Label>
            <Input id="prop-key" value={field.key} onChange={(e) => onChange({ key: e.target.value.replace(/\s+/g, '_') })} />
          </div>
        )}

        <div>
          <Label htmlFor="prop-description">{field.kind === 'paragraph' ? 'Text' : 'Description'}</Label>
          <Textarea
            id="prop-description"
            rows={2}
            value={field.description ?? ''}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        {!isMetadata && (
          <>
            <div>
              <Label htmlFor="prop-placeholder">Placeholder</Label>
              <Input id="prop-placeholder" value={field.placeholder ?? ''} onChange={(e) => onChange({ placeholder: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="prop-default">Default value</Label>
              <Input
                id="prop-default"
                value={typeof field.default === 'string' || typeof field.default === 'number' ? String(field.default) : ''}
                onChange={(e) => onChange({ default: e.target.value || undefined })}
              />
            </div>
            <div>
              <Label htmlFor="prop-help">Help text</Label>
              <Input id="prop-help" value={field.helpText ?? ''} onChange={(e) => onChange({ helpText: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="prop-tooltip">Tooltip</Label>
              <Input id="prop-tooltip" value={field.tooltip ?? ''} onChange={(e) => onChange({ tooltip: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prop-css">CSS class</Label>
                <Input id="prop-css" value={field.cssClass ?? ''} onChange={(e) => onChange({ cssClass: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="prop-width">Width</Label>
                <select
                  id="prop-width"
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={field.width}
                  onChange={(e) => onChange({ width: e.target.value as FieldWidth })}
                >
                  {WIDTH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </section>

      {KINDS_WITH_OPTIONS.includes(field.kind) && (
        <section>
          <Label htmlFor="prop-options">Options (comma separated)</Label>
          <Input
            id="prop-options"
            value={(field.options ?? []).join(', ')}
            onChange={(e) =>
              onChange({
                options: e.target.value
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean),
              })
            }
          />
        </section>
      )}

      {isArrayLike && field.kind === 'array' && (
        <section>
          <Label htmlFor="prop-item-kind">List item type</Label>
          <select
            id="prop-item-kind"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={field.arrayItemKind ?? 'text'}
            onChange={(e) => onChange({ arrayItemKind: e.target.value as FieldDraft['arrayItemKind'] })}
          >
            {CONTAINER_ITEM_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose &quot;object&quot; to nest the fields you drop inside this array as columns of each row.
          </p>
        </section>
      )}

      {field.kind === 'dynamicTable' && (
        <p className="text-xs text-muted-foreground">
          Drop fields inside this table on the canvas — each becomes a column, and every row repeats that set.
        </p>
      )}

      {field.kind === 'formula' && (
        <section>
          <FormulaEditor value={field.formula ?? ''} fieldRefs={fieldRefs} onChange={(formula) => onChange({ formula })} />
        </section>
      )}

      {!isMetadata && field.kind !== 'formula' && (
        <section className="space-y-3 border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Validation</h4>
          <ValidationEditor kind={field.kind} value={field.validation} onChange={(validation) => onChange({ validation })} />
        </section>
      )}

      {!isMetadata && (
        <section className="space-y-3 border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conditional logic</h4>
          <ConditionalLogicEditor
            rules={field.conditional ?? []}
            fieldRefs={flattenFieldRefs(allFields)}
            onChange={(conditional) => onChange({ conditional })}
          />
        </section>
      )}

      {!isMetadata && (
        <section className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <Switch checked={field.required} onCheckedChange={(required) => onChange({ required })} label="Required" />
          <Switch checked={field.readOnly} onCheckedChange={(readOnly) => onChange({ readOnly })} label="Read-only" />
          <Switch checked={field.disabled} onCheckedChange={(disabled) => onChange({ disabled })} label="Disabled" />
          <Switch checked={field.hidden} onCheckedChange={(hidden) => onChange({ hidden })} label="Hidden" />
        </section>
      )}
    </div>
  );
}
