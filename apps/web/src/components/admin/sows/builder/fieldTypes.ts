import type { RJSFSchema } from '@rjsf/utils';

export type FieldKind =
  | 'shortText'
  | 'longText'
  | 'number'
  | 'integer'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'dateTime'
  | 'select'
  | 'multiSelect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'file'
  | 'image'
  | 'array'
  | 'object';

export type FieldDraft = {
  key: string;
  kind: FieldKind;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  readOnly: boolean;
  hidden: boolean;
  default?: unknown;
  options?: string[]; // enum values, for select/multiSelect/radio
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  arrayItemKind?: FieldKind; // for kind === 'array'
  children?: FieldDraft[]; // for kind === 'object', or array items when arrayItemKind === 'object'
  showIf?: { field: string; equals: string }; // conditional visibility against a sibling field
};

export const FIELD_KIND_LABELS: Record<FieldKind, string> = {
  shortText: 'Short text',
  longText: 'Long text',
  number: 'Number',
  integer: 'Integer',
  email: 'Email',
  phone: 'Phone',
  url: 'URL',
  date: 'Date',
  time: 'Time',
  dateTime: 'Date & time',
  select: 'Select',
  multiSelect: 'Multi-select',
  radio: 'Radio',
  checkbox: 'Checkbox',
  switch: 'Boolean switch',
  file: 'File upload',
  image: 'Image upload',
  array: 'Repeatable list',
  object: 'Nested group',
};

export const KINDS_WITH_OPTIONS: FieldKind[] = ['select', 'multiSelect', 'radio'];

export function newField(existingKeys: string[]): FieldDraft {
  let i = existingKeys.length + 1;
  let key = `field${i}`;
  while (existingKeys.includes(key)) {
    i += 1;
    key = `field${i}`;
  }
  return {
    key,
    kind: 'shortText',
    title: 'New field',
    required: false,
    readOnly: false,
    hidden: false,
  };
}

function fieldSchema(field: FieldDraft): { schema: RJSFSchema; uiSchema: Record<string, unknown> } {
  const ui: Record<string, unknown> = {};
  if (field.description) ui['ui:help'] = field.description;
  if (field.placeholder) ui['ui:placeholder'] = field.placeholder;
  if (field.readOnly) ui['ui:readonly'] = true;
  if (field.hidden) ui['ui:widget'] = 'hidden';

  let schema: RJSFSchema;
  switch (field.kind) {
    case 'shortText':
      schema = { type: 'string' };
      break;
    case 'longText':
      schema = { type: 'string' };
      ui['ui:widget'] = field.hidden ? 'hidden' : 'textarea';
      break;
    case 'number':
      schema = { type: 'number' };
      break;
    case 'integer':
      schema = { type: 'integer' };
      break;
    case 'email':
      schema = { type: 'string', format: 'email' };
      break;
    case 'phone':
      schema = { type: 'string', pattern: field.pattern || '^[0-9+()\\-\\s]{7,20}$' };
      break;
    case 'url':
      schema = { type: 'string', format: 'uri' };
      break;
    case 'date':
      schema = { type: 'string', format: 'date' };
      break;
    case 'time':
      schema = { type: 'string', format: 'time' };
      break;
    case 'dateTime':
      schema = { type: 'string', format: 'date-time' };
      break;
    case 'select':
      schema = { type: 'string', enum: field.options?.length ? field.options : ['Option 1'] };
      break;
    case 'multiSelect':
      schema = {
        type: 'array',
        items: { type: 'string', enum: field.options?.length ? field.options : ['Option 1'] },
        uniqueItems: true,
      };
      break;
    case 'radio':
      schema = { type: 'string', enum: field.options?.length ? field.options : ['Option 1'] };
      if (!field.hidden) ui['ui:widget'] = 'radio';
      break;
    case 'checkbox':
      schema = { type: 'boolean' };
      break;
    case 'switch':
      schema = { type: 'boolean' };
      if (!field.hidden) ui['ui:widget'] = 'switch';
      break;
    case 'file':
      schema = { type: 'string', format: 'data-url' };
      if (!field.hidden) ui['ui:widget'] = 'file';
      break;
    case 'image':
      schema = { type: 'string', format: 'data-url' };
      if (!field.hidden) {
        ui['ui:widget'] = 'file';
        ui['ui:options'] = { accept: 'image/*' };
      }
      break;
    case 'array': {
      const itemKind = field.arrayItemKind ?? 'shortText';
      if (itemKind === 'object') {
        const built = buildObjectSchema(field.children ?? []);
        schema = { type: 'array', items: built.schema };
        if (Object.keys(built.uiSchema).length) ui.items = built.uiSchema;
      } else {
        const itemBuilt = fieldSchema({ ...field, kind: itemKind, key: field.key });
        schema = { type: 'array', items: itemBuilt.schema };
      }
      break;
    }
    case 'object': {
      const built = buildObjectSchema(field.children ?? []);
      schema = built.schema;
      if (Object.keys(built.uiSchema).length) Object.assign(ui, built.uiSchema);
      break;
    }
    default:
      schema = { type: 'string' };
  }

  if (field.title) schema.title = field.title;
  if (field.description) schema.description = field.description;
  if (field.default !== undefined) schema.default = field.default as RJSFSchema['default'];
  if (field.minLength !== undefined) schema.minLength = field.minLength;
  if (field.maxLength !== undefined) schema.maxLength = field.maxLength;
  if (field.minimum !== undefined) schema.minimum = field.minimum;
  if (field.maximum !== undefined) schema.maximum = field.maximum;
  if (field.pattern && field.kind !== 'phone') schema.pattern = field.pattern;

  return { schema, uiSchema: ui };
}

export function buildObjectSchema(fields: FieldDraft[]): {
  schema: RJSFSchema;
  uiSchema: Record<string, unknown>;
} {
  const properties: Record<string, RJSFSchema> = {};
  const required: string[] = [];
  const uiSchema: Record<string, unknown> = { 'ui:order': fields.map((f) => f.key) };
  const allOf: RJSFSchema[] = [];

  for (const field of fields) {
    const { schema, uiSchema: fieldUi } = fieldSchema(field);
    properties[field.key] = schema;
    if (field.required) required.push(field.key);
    if (Object.keys(fieldUi).length) uiSchema[field.key] = fieldUi;

    if (field.showIf?.field && field.showIf.equals !== undefined) {
      allOf.push({
        if: { properties: { [field.showIf.field]: { const: field.showIf.equals } }, required: [field.showIf.field] },
        then: { properties: { [field.key]: schema }, required: field.required ? [field.key] : [] },
        else: { properties: { [field.key]: { readOnly: true } } },
      } as RJSFSchema);
    }
  }

  const schema: RJSFSchema = {
    type: 'object',
    properties,
    ...(required.length ? { required } : {}),
    ...(allOf.length ? { allOf } : {}),
  };

  return { schema, uiSchema };
}

export function draftsToDefaultValues(fields: FieldDraft[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.default !== undefined) values[field.key] = field.default;
  }
  return values;
}
