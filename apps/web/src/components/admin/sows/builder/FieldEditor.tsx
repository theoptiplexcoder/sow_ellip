'use client';

import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  FIELD_KIND_LABELS,
  KINDS_WITH_OPTIONS,
  newField,
  type FieldDraft,
  type FieldKind,
} from './fieldTypes';

const KIND_OPTIONS = Object.entries(FIELD_KIND_LABELS) as [FieldKind, string][];

export function FieldEditor({
  fields,
  onChange,
}: {
  fields: FieldDraft[];
  onChange: (fields: FieldDraft[]) => void;
}) {
  function updateField(index: number, patch: Partial<FieldDraft>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function addField() {
    onChange([...fields, newField(fields.map((f) => f.key))]);
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function duplicateField(index: number) {
    const source = fields[index];
    const clone = { ...source, key: newField(fields.map((f) => f.key)).key, title: `${source.title} (copy)` };
    const next = [...fields];
    next.splice(index + 1, 0, clone);
    onChange(next);
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={index} className="rounded-md border border-border p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">
              {field.title || field.key}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Move field up"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                disabled={index === 0}
                onClick={() => moveField(index, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Move field down"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                disabled={index === fields.length - 1}
                onClick={() => moveField(index, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Duplicate field"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                onClick={() => duplicateField(index)}
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Remove field"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-red-600"
                onClick={() => removeField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`field-key-${index}`}>Field key</Label>
              <Input
                id={`field-key-${index}`}
                value={field.key}
                onChange={(e) => updateField(index, { key: e.target.value.replace(/\s+/g, '_') })}
              />
            </div>
            <div>
              <Label htmlFor={`field-type-${index}`}>Type</Label>
              <select
                id={`field-type-${index}`}
                aria-label="Field type"
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={field.kind}
                onChange={(e) => updateField(index, { kind: e.target.value as FieldKind })}
              >
                {KIND_OPTIONS.map(([kind, label]) => (
                  <option key={kind} value={kind}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor={`field-title-${index}`}>Title</Label>
              <Input
                id={`field-title-${index}`}
                value={field.title}
                onChange={(e) => updateField(index, { title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`field-placeholder-${index}`}>Placeholder</Label>
              <Input
                id={`field-placeholder-${index}`}
                value={field.placeholder ?? ''}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor={`field-help-${index}`}>Help text</Label>
              <Input
                id={`field-help-${index}`}
                value={field.description ?? ''}
                onChange={(e) => updateField(index, { description: e.target.value })}
              />
            </div>

            {KINDS_WITH_OPTIONS.includes(field.kind) && (
              <div className="col-span-2">
                <Label htmlFor={`field-options-${index}`}>Options (comma separated)</Label>
                <Input
                  id={`field-options-${index}`}
                  value={(field.options ?? []).join(', ')}
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            )}

            {(field.kind === 'shortText' || field.kind === 'longText' || field.kind === 'phone') && (
              <>
                <div>
                  <Label htmlFor={`field-minlength-${index}`}>Min length</Label>
                  <Input
                    id={`field-minlength-${index}`}
                    type="number"
                    value={field.minLength ?? ''}
                    onChange={(e) =>
                      updateField(index, { minLength: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`field-maxlength-${index}`}>Max length</Label>
                  <Input
                    id={`field-maxlength-${index}`}
                    type="number"
                    value={field.maxLength ?? ''}
                    onChange={(e) =>
                      updateField(index, { maxLength: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`field-pattern-${index}`}>Regex pattern</Label>
                  <Input
                    id={`field-pattern-${index}`}
                    value={field.pattern ?? ''}
                    onChange={(e) => updateField(index, { pattern: e.target.value || undefined })}
                  />
                </div>
              </>
            )}

            {(field.kind === 'number' || field.kind === 'integer') && (
              <>
                <div>
                  <Label htmlFor={`field-min-${index}`}>Minimum</Label>
                  <Input
                    id={`field-min-${index}`}
                    type="number"
                    value={field.minimum ?? ''}
                    onChange={(e) =>
                      updateField(index, { minimum: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`field-max-${index}`}>Maximum</Label>
                  <Input
                    id={`field-max-${index}`}
                    type="number"
                    value={field.maximum ?? ''}
                    onChange={(e) =>
                      updateField(index, { maximum: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
              </>
            )}

            {field.kind === 'array' && (
              <div>
                <Label htmlFor={`field-item-kind-${index}`}>List item type</Label>
                <select
                  id={`field-item-kind-${index}`}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={field.arrayItemKind ?? 'shortText'}
                  onChange={(e) => updateField(index, { arrayItemKind: e.target.value as FieldKind })}
                >
                  {KIND_OPTIONS.filter(([k]) => k !== 'array').map(([kind, label]) => (
                    <option key={kind} value={kind}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(field.kind === 'object' || (field.kind === 'array' && field.arrayItemKind === 'object')) && (
            <div className="mt-4 border-l-2 border-border pl-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Group fields
              </p>
              <FieldEditor
                fields={field.children ?? []}
                onChange={(children) => updateField(index, { children })}
              />
            </div>
          )}

          {fields.length > 1 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Conditional visibility
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`field-showif-field-${index}`}>Show only when field</Label>
                  <select
                    id={`field-showif-field-${index}`}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={field.showIf?.field ?? ''}
                    onChange={(e) =>
                      updateField(index, {
                        showIf: e.target.value
                          ? { field: e.target.value, equals: field.showIf?.equals ?? '' }
                          : undefined,
                      })
                    }
                  >
                    <option value="">Always visible</option>
                    {fields
                      .filter((_, i) => i !== index)
                      .map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.title || f.key}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor={`field-showif-value-${index}`}>Equals value</Label>
                  <Input
                    id={`field-showif-value-${index}`}
                    disabled={!field.showIf?.field}
                    value={field.showIf?.equals ?? ''}
                    onChange={(e) =>
                      updateField(index, { showIf: { field: field.showIf!.field, equals: e.target.value } })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3">
            <label className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(index, { required: e.target.checked })}
              />
              Required
            </label>
            <label className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={field.readOnly}
                onChange={(e) => updateField(index, { readOnly: e.target.checked })}
              />
              Read-only
            </label>
            <label className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={field.hidden}
                onChange={(e) => updateField(index, { hidden: e.target.checked })}
              />
              Hidden
            </label>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addField}>
        <Plus className="h-4 w-4" />
        Add field
      </Button>
    </div>
  );
}
