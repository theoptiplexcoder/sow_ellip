// Core type definitions for the SOW template builder.
// A template is a tree of FieldDraft nodes. Container kinds (object, array,
// dynamicTable, section, card, accordion, tabs) hold further FieldDraft nodes
// in `children`; every other kind is a leaf that maps to one JSON Schema
// property.

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
  // Container
  | 'object'
  | 'array'
  | 'dynamicTable'
  | 'section'
  | 'card'
  | 'accordion'
  | 'tabs'
  // Metadata
  | 'heading'
  | 'paragraph'
  | 'divider'
  // Workflow
  | 'signature'
  | 'approval'
  | 'status'
  | 'tags'
  // Computed
  | 'formula';

export type FieldCategory = 'basic' | 'advanced' | 'enterprise' | 'container' | 'metadata' | 'workflow' | 'computed';

export const CONTAINER_KINDS: FieldKind[] = ['object', 'array', 'dynamicTable', 'section', 'card', 'accordion', 'tabs'];
export const KINDS_WITH_OPTIONS: FieldKind[] = ['select', 'multiSelect', 'radio'];
export const METADATA_KINDS: FieldKind[] = ['heading', 'paragraph', 'divider'];
export const TEXT_LENGTH_KINDS: FieldKind[] = ['text', 'textarea', 'phone', 'richText', 'markdown', 'address'];
export const NUMERIC_KINDS: FieldKind[] = ['number', 'currency', 'percentage'];

export const FIELD_KIND_LABELS: Record<FieldKind, string> = {
  text: 'Text',
  textarea: 'Textarea',
  number: 'Number',
  date: 'Date',
  time: 'Time',
  dateTime: 'Date & Time',
  email: 'Email',
  url: 'URL',
  checkbox: 'Checkbox',
  radio: 'Radio',
  select: 'Select',
  multiSelect: 'Multi Select',
  switch: 'Switch',
  richText: 'Rich Text',
  markdown: 'Markdown',
  currency: 'Currency',
  percentage: 'Percentage',
  phone: 'Phone',
  address: 'Address',
  file: 'File Upload',
  image: 'Image Upload',
  employeeLookup: 'Employee Lookup',
  clientLookup: 'Client Lookup',
  department: 'Department',
  organization: 'Organization',
  vendor: 'Vendor',
  project: 'Project',
  object: 'Object',
  array: 'Array',
  dynamicTable: 'Dynamic Table',
  section: 'Section',
  card: 'Card',
  accordion: 'Accordion',
  tabs: 'Tabs',
  heading: 'Heading',
  paragraph: 'Paragraph',
  divider: 'Divider',
  signature: 'Signature',
  approval: 'Approval',
  status: 'Status',
  tags: 'Tags',
  formula: 'Formula',
};

export const FIELD_CATEGORY_LABELS: Record<FieldCategory, string> = {
  basic: 'Basic Fields',
  advanced: 'Advanced Fields',
  enterprise: 'Enterprise Fields',
  container: 'Container Fields',
  metadata: 'Metadata Fields',
  workflow: 'Workflow Fields',
  computed: 'Computed Fields',
};

export const FIELD_PALETTE: Record<FieldCategory, FieldKind[]> = {
  basic: [
    'text', 'textarea', 'number', 'date', 'time', 'dateTime', 'email', 'url',
    'checkbox', 'radio', 'select', 'multiSelect', 'switch',
  ],
  advanced: ['richText', 'markdown', 'currency', 'percentage', 'phone', 'address', 'file', 'image'],
  enterprise: ['employeeLookup', 'clientLookup', 'department', 'organization', 'vendor', 'project'],
  container: ['object', 'array', 'dynamicTable', 'section', 'card', 'accordion', 'tabs'],
  metadata: ['heading', 'paragraph', 'divider'],
  workflow: ['signature', 'approval', 'status', 'tags'],
  computed: ['formula'],
};

export type FieldWidth = '25' | '50' | '75' | '100';

export type ValidationRule = {
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  /** Free-form validator body, persisted for server-side enforcement (not executed in the browser). */
  customValidator?: string;
  errorMessages?: Partial<
    Record<'required' | 'minLength' | 'maxLength' | 'minimum' | 'maximum' | 'pattern' | 'custom', string>
  >;
};

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'greaterThan'
  | 'lessThan'
  | 'isEmpty'
  | 'isNotEmpty';

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'equals',
  notEquals: 'does not equal',
  contains: 'contains',
  greaterThan: 'is greater than',
  lessThan: 'is less than',
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty',
};

export type Condition = {
  type: 'condition';
  field: string;
  operator: ConditionOperator;
  value?: string;
};

export type ConditionGroup = {
  type: 'group';
  logic: 'AND' | 'OR';
  children: (Condition | ConditionGroup)[];
};

export type ConditionalActionKind = 'show' | 'hide' | 'require' | 'disable' | 'enable';

export type ConditionalAction = {
  action: ConditionalActionKind;
  target: string;
};

export type ConditionalRule = {
  id: string;
  when: ConditionGroup;
  actions: ConditionalAction[];
};

export function emptyConditionGroup(): ConditionGroup {
  return { type: 'group', logic: 'AND', children: [] };
}

export type FieldDraft = {
  key: string;
  kind: FieldKind;
  title: string;
  description?: string;
  placeholder?: string;
  default?: unknown;
  required: boolean;
  readOnly: boolean;
  hidden: boolean;
  disabled: boolean;
  helpText?: string;
  tooltip?: string;
  cssClass?: string;
  width: FieldWidth;
  options?: string[];
  validation?: ValidationRule;
  conditional?: ConditionalRule[];
  /** Only set when kind === 'formula'. Expression may reference sibling keys as {key}. */
  formula?: string;
  /** Only relevant for kind === 'array' | 'dynamicTable'. */
  arrayItemKind?: FieldKind;
  /** Children for container kinds. */
  children?: FieldDraft[];
};

let idSeq = 0;
export function nextId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${idSeq}`;
}

export function newField(existingKeys: string[], kind: FieldKind = 'text'): FieldDraft {
  let i = existingKeys.length + 1;
  let key = `field${i}`;
  while (existingKeys.includes(key)) {
    i += 1;
    key = `field${i}`;
  }
  const field: FieldDraft = {
    key,
    kind,
    title: FIELD_KIND_LABELS[kind],
    required: false,
    readOnly: false,
    hidden: false,
    disabled: false,
    width: '100',
  };
  if (CONTAINER_KINDS.includes(kind)) field.children = [];
  if (kind === 'array' || kind === 'dynamicTable') field.arrayItemKind = 'text';
  if (KINDS_WITH_OPTIONS.includes(kind)) field.options = ['Option 1', 'Option 2'];
  if (kind === 'formula') field.formula = '';
  return field;
}

export function collectKeys(fields: FieldDraft[]): string[] {
  const keys: string[] = [];
  for (const f of fields) {
    keys.push(f.key);
    if (f.children?.length) keys.push(...collectKeys(f.children));
  }
  return keys;
}

/** Flat list of {key, title} for every leaf/container field in the tree — used to populate pickers. */
export function flattenFieldRefs(fields: FieldDraft[]): { key: string; title: string }[] {
  const out: { key: string; title: string }[] = [];
  for (const f of fields) {
    if (!METADATA_KINDS.includes(f.kind)) out.push({ key: f.key, title: f.title || f.key });
    if (f.children?.length) out.push(...flattenFieldRefs(f.children));
  }
  return out;
}
