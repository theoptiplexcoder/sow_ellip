import type { FieldDraft } from './builder/fieldTypes';

export type SowFieldChange = {
  fieldLabel: string;
  /** null means the field was empty/unset before this version */
  oldValue: string | null;
  /** null means the field was cleared in this version */
  newValue: string | null;
};

export type SowVersionEntry = {
  version: number;
  updatedAt: string;
  updatedBy: string;
  /** Empty on the version a SOW was first created */
  changes: SowFieldChange[];
};

export const VERSION_HISTORY_BY_SOW: Record<string, SowVersionEntry[]> = {};

export function getVersionHistory(sowId: string): SowVersionEntry[] {
  return VERSION_HISTORY_BY_SOW[sowId] ?? [];
}

export function recordVersion(sowId: string, entry: SowVersionEntry) {
  VERSION_HISTORY_BY_SOW[sowId] = [...(VERSION_HISTORY_BY_SOW[sowId] ?? []), entry];
}

const METADATA_KINDS: FieldDraft['kind'][] = ['heading', 'paragraph', 'divider'];
const FLATTENED_KINDS: FieldDraft['kind'][] = ['section', 'card', 'accordion', 'tabs'];

function formatFieldValue(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) {
    const formatted = value.map((v) => formatFieldValue(v) ?? '').filter(Boolean);
    return formatted.length ? formatted.join(', ') : null;
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Diffs formData between two versions, following the same field-to-schema-key mapping as buildObjectSchema. */
export function diffFormData(
  fields: FieldDraft[],
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
): SowFieldChange[] {
  const changes: SowFieldChange[] = [];

  function walk(list: FieldDraft[], oldScope: Record<string, unknown>, newScope: Record<string, unknown>) {
    for (const field of list) {
      if (METADATA_KINDS.includes(field.kind)) continue;
      if (FLATTENED_KINDS.includes(field.kind)) {
        if (field.children?.length) walk(field.children, oldScope, newScope);
        continue;
      }
      if (field.kind === 'object' && field.children?.length) {
        walk(
          field.children,
          (oldScope[field.key] as Record<string, unknown>) ?? {},
          (newScope[field.key] as Record<string, unknown>) ?? {},
        );
        continue;
      }
      const oldValue = formatFieldValue(oldScope[field.key]);
      const newValue = formatFieldValue(newScope[field.key]);
      if (oldValue !== newValue) {
        changes.push({ fieldLabel: field.title || field.key, oldValue, newValue });
      }
    }
  }

  walk(fields, oldData ?? {}, newData ?? {});
  return changes;
}
