// Converts the flat FieldDraft registry into an RJSF JSON Schema + UI Schema,
// used by the "Live preview" tab and by the participant fill page. Nesting
// for `object`/`array`/`dynamicTable` fields comes from `parentKey` on the
// child, not from a tree structure — see the "Field registry vs. document
// body" design decision.

import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import type { FieldDraft, FieldKind } from './types';

const LOOKUP_KINDS: FieldKind[] = ['employeeLookup', 'clientLookup', 'department', 'organization', 'vendor', 'project'];

function widgetFieldSchema(field: FieldDraft): { schema: RJSFSchema; uiOptions: Record<string, unknown> } {
  const ui: Record<string, unknown> = {};
  let schema: RJSFSchema;

  switch (field.kind) {
    case 'text':
      schema = { type: 'string' };
      break;
    case 'textarea':
      schema = { type: 'string' };
      ui.widget = 'textarea';
      break;
    case 'number':
      schema = { type: 'number' };
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
    case 'email':
      schema = { type: 'string', format: 'email' };
      break;
    case 'url':
      schema = { type: 'string', format: 'uri' };
      break;
    case 'checkbox':
      schema = { type: 'boolean' };
      break;
    case 'radio':
      schema = { type: 'string', enum: field.options?.length ? field.options : ['Option 1'] };
      ui.widget = 'radio';
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
    case 'switch':
      schema = { type: 'boolean' };
      break;
    case 'richText':
    case 'markdown':
      schema = { type: 'string' };
      ui.widget = 'textarea';
      break;
    case 'currency':
      schema = { type: 'number' };
      break;
    case 'percentage':
      schema = { type: 'number', minimum: 0, maximum: 100 };
      break;
    case 'phone':
      schema = { type: 'string' };
      break;
    case 'address':
      schema = {
        type: 'object',
        properties: {
          line1: { type: 'string', title: 'Address line 1' },
          line2: { type: 'string', title: 'Address line 2' },
          city: { type: 'string', title: 'City' },
          state: { type: 'string', title: 'State / Province' },
          postalCode: { type: 'string', title: 'Postal code' },
          country: { type: 'string', title: 'Country' },
        },
      };
      break;
    case 'file':
      schema = { type: 'string', format: 'data-url' };
      break;
    case 'image':
      schema = { type: 'string', format: 'data-url' };
      ui.options = { accept: 'image/*' };
      break;
    case 'signature':
      schema = { type: 'string' };
      ui.widget = 'signature';
      break;
    case 'approval':
      schema = { type: 'string', enum: ['Pending', 'Approved', 'Rejected'] };
      break;
    case 'status':
      schema = { type: 'string', enum: field.options?.length ? field.options : ['Draft', 'In Review', 'Final'] };
      break;
    case 'tags':
      schema = { type: 'array', items: { type: 'string' } };
      break;
    case 'formula':
      schema = { type: 'number', readOnly: true };
      ui.options = { expression: field.formula ?? '' };
      break;
    default:
      schema = { type: 'string' };
      if (LOOKUP_KINDS.includes(field.kind)) ui.widget = 'lookup';
  }

  return { schema, uiOptions: ui };
}

function applyCommonSchemaProps(schema: RJSFSchema, field: FieldDraft) {
  if (field.title) schema.title = field.title;
  if (field.description) schema.description = field.description;
  if (field.default !== undefined) schema.default = field.default as RJSFSchema['default'];
  if (field.readOnly) schema.readOnly = true;
}

function indexByParent(fields: FieldDraft[]): Map<string, FieldDraft[]> {
  const map = new Map<string, FieldDraft[]>();
  for (const f of fields) {
    if (!f.parentKey) continue;
    const list = map.get(f.parentKey) ?? [];
    list.push(f);
    map.set(f.parentKey, list);
  }
  return map;
}

function buildFieldSchema(field: FieldDraft, byParent: Map<string, FieldDraft[]>): { schema: RJSFSchema; uiSchema: UiSchema } {
  const uiSchema: Record<string, unknown> = {};
  let schema: RJSFSchema;

  if (field.kind === 'object') {
    const built = buildSchemaFor(byParent.get(field.key) ?? [], byParent);
    schema = built.schema;
    Object.assign(uiSchema, built.uiSchema);
  } else if (field.kind === 'array' || field.kind === 'dynamicTable') {
    const members = byParent.get(field.key) ?? [];
    if (members.length) {
      const built = buildSchemaFor(members, byParent);
      schema = { type: 'array', items: built.schema };
      if (Object.keys(built.uiSchema).length) uiSchema.items = built.uiSchema;
    } else {
      const item = widgetFieldSchema({ ...field, kind: field.arrayItemKind ?? 'text' });
      schema = { type: 'array', items: item.schema };
    }
    if (field.kind === 'dynamicTable') uiSchema['ui:options'] = { variant: 'table' };
  } else {
    const { schema: leafSchema, uiOptions } = widgetFieldSchema(field);
    schema = leafSchema;
    if (uiOptions.widget) uiSchema['ui:widget'] = uiOptions.widget;
    const opts = { ...(typeof uiOptions.options === 'object' ? uiOptions.options : {}) } as Record<string, unknown>;
    if (Object.keys(opts).length) uiSchema['ui:options'] = opts;
  }

  if (field.placeholder) uiSchema['ui:placeholder'] = field.placeholder;
  if (field.readOnly) uiSchema['ui:readonly'] = true;

  applyCommonSchemaProps(schema, field);
  return { schema, uiSchema };
}

function buildSchemaFor(fields: FieldDraft[], byParent: Map<string, FieldDraft[]>): { schema: RJSFSchema; uiSchema: UiSchema } {
  const properties: Record<string, RJSFSchema> = {};
  const required: string[] = [];
  const uiSchema: Record<string, unknown> = {};
  const order: string[] = [];

  for (const field of fields) {
    const { schema, uiSchema: fieldUi } = buildFieldSchema(field, byParent);
    properties[field.key] = schema;
    order.push(field.key);
    if (field.required) required.push(field.key);
    if (Object.keys(fieldUi).length) uiSchema[field.key] = fieldUi;
  }

  uiSchema['ui:order'] = order;
  return { schema: { type: 'object', properties, ...(required.length ? { required } : {}) }, uiSchema };
}

/** Builds the RJSF schema for the top-level (parentKey-less) fields in the registry. */
export function buildObjectSchema(fields: FieldDraft[]): { schema: RJSFSchema; uiSchema: UiSchema } {
  const byParent = indexByParent(fields);
  const topLevel = fields.filter((f) => !f.parentKey);
  return buildSchemaFor(topLevel, byParent);
}

export function draftsToDefaultValues(fields: FieldDraft[]): Record<string, unknown> {
  const byParent = indexByParent(fields);

  function valuesFor(list: FieldDraft[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const field of list) {
      if (field.default !== undefined) values[field.key] = field.default;
      else if (field.kind === 'object') {
        const children = byParent.get(field.key) ?? [];
        if (children.length) values[field.key] = valuesFor(children);
      }
    }
    return values;
  }

  return valuesFor(fields.filter((f) => !f.parentKey));
}
