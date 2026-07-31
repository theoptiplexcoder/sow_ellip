// Core type definitions for the SOW template builder's field registry.
// Fields are a flat, order-insignificant registry keyed by `key`; the
// ProseMirror `body` doc (see `pm/schema.ts`) expresses layout/ordering via
// inline/block field tokens. Container-like kinds that affect the JSON
// Schema (`object`, `array`, `dynamicTable`) reference their members via
// `parentKey` on the child, rather than nesting.

export type FieldKind =
  // Basic
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'dateTime'
  | 'email'
  | 'url'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'multiSelect'
  | 'switch'
  // Advanced
  | 'richText'
  | 'markdown'
  | 'currency'
  | 'percentage'
  | 'phone'
  | 'address'
  | 'file'
  | 'image'
  // Enterprise
  | 'employeeLookup'
  | 'clientLookup'
  | 'department'
  | 'organization'
  | 'vendor'
  | 'project'
  // Container (referenced via parentKey, not nested)
  | 'object'
  | 'array'
  | 'dynamicTable'
  // Workflow
  | 'signature'
  | 'approval'
  | 'status'
  | 'tags'
  // Computed
  | 'formula';

/** Kinds whose values are array/dynamicTable/signature-style and don't fit inline text. */
export const BLOCK_ONLY_KINDS: FieldKind[] = ['array', 'dynamicTable', 'signature'];

export type FieldWidth = '25' | '50' | '75' | '100';

export type FieldDraft = {
  key: string;
  kind: FieldKind;
  title: string;
  description?: string;
  placeholder?: string;
  default?: unknown;
  required: boolean;
  readOnly: boolean;
  width: FieldWidth;
  options?: string[];
  /** Only set when kind === 'formula'. Expression may reference sibling keys as {key}. */
  formula?: string;
  /** Only relevant for kind === 'array' | 'dynamicTable'. */
  arrayItemKind?: FieldKind;
  /** Set when this field is a member of an `object`/`array`/`dynamicTable` field. */
  parentKey?: string;
};

let fieldKeySeq = 0;

export function newField(existingKeys: string[], kind: FieldKind = 'text'): FieldDraft {
  let key = `field${++fieldKeySeq}`;
  while (existingKeys.includes(key)) {
    key = `field${++fieldKeySeq}`;
  }
  return {
    key,
    kind,
    title: key,
    required: false,
    readOnly: false,
    width: '100',
  };
}
