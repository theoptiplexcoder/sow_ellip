import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { extractFormulaRefs } from './formulaEngine';
import type { ConditionalActionKind, ConditionalRule, FieldDraft, FieldKind, FieldWidth } from './types';

export * from './types';

const LAYOUT_ONLY_KINDS: FieldKind[] = ['section', 'card'];
const PANEL_KINDS: FieldKind[] = ['accordion', 'tabs'];
const METADATA_KINDS: FieldKind[] = ['heading', 'paragraph', 'divider'];

export type LayoutNode =
  | { kind: 'field'; key: string; width: FieldWidth }
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'divider' }
  | { kind: 'section'; title?: string; children: LayoutNode[] }
  | { kind: 'card'; title?: string; children: LayoutNode[] }
  | { kind: 'accordion'; title?: string; panels: { title: string; children: LayoutNode[] }[] }
  | { kind: 'tabs'; title?: string; panels: { title: string; children: LayoutNode[] }[] };

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
      ui.widget = 'switch';
      break;
    case 'richText':
      schema = { type: 'string' };
      ui.widget = 'richtext';
      break;
    case 'markdown':
      schema = { type: 'string' };
      ui.widget = 'markdown';
      break;
    case 'currency':
      schema = { type: 'number' };
      ui.widget = 'currency';
      break;
    case 'percentage':
      schema = { type: 'number', minimum: field.validation?.minimum ?? 0, maximum: field.validation?.maximum ?? 100 };
      ui.widget = 'percentage';
      break;
    case 'phone':
      schema = { type: 'string', pattern: field.validation?.pattern || '^[0-9+()\\-\\s]{7,20}$' };
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
      ui.widget = 'file';
      break;
    case 'image':
      schema = { type: 'string', format: 'data-url' };
      ui.widget = 'file';
      ui.options = { accept: 'image/*' };
      break;
    case 'signature':
      schema = { type: 'string' };
      ui.widget = 'signature';
      break;
    case 'approval':
      schema = { type: 'string', enum: ['Pending', 'Approved', 'Rejected'] };
      ui.widget = 'approval';
      break;
    case 'status':
      schema = { type: 'string', enum: field.options?.length ? field.options : ['Draft', 'In Review', 'Final'] };
      ui.widget = 'status';
      break;
    case 'tags':
      schema = { type: 'array', items: { type: 'string' } };
      ui.widget = 'tags';
      break;
    case 'formula':
      schema = { type: 'number', readOnly: true };
      ui.widget = 'formula';
      ui.expression = field.formula ?? '';
      ui.refs = extractFormulaRefs(field.formula ?? '');
      break;
    default:
      if (LOOKUP_KINDS.includes(field.kind)) {
        schema = { type: 'string' };
        ui.widget = 'lookup';
        ui.lookupType = field.kind;
        break;
      }
      schema = { type: 'string' };
  }

  return { schema, uiOptions: ui };
}

function applyCommonSchemaProps(schema: RJSFSchema, field: FieldDraft) {
  if (field.title) schema.title = field.title;
  if (field.description) schema.description = field.description;
  if (field.default !== undefined) schema.default = field.default as RJSFSchema['default'];
  const v = field.validation;
  if (v?.minLength !== undefined) schema.minLength = v.minLength;
  if (v?.maxLength !== undefined) schema.maxLength = v.maxLength;
  if (v?.minimum !== undefined) schema.minimum = v.minimum;
  if (v?.maximum !== undefined) schema.maximum = v.maximum;
  if (v?.pattern && field.kind !== 'phone') schema.pattern = v.pattern;
  if (field.readOnly) schema.readOnly = true;
}

function buildLeafOrContainerSchema(field: FieldDraft): { schema: RJSFSchema; uiSchema: UiSchema } {
  const uiSchema: Record<string, unknown> = {};

  let schema: RJSFSchema;
  if (field.kind === 'object') {
    const built = buildObjectSchema(field.children ?? []);
    schema = built.schema;
    Object.assign(uiSchema, built.uiSchema);
  } else if (field.kind === 'array' || field.kind === 'dynamicTable') {
    const itemKind = field.kind === 'dynamicTable' ? 'object' : (field.arrayItemKind ?? 'text');
    if (itemKind === 'object') {
      const built = buildObjectSchema(field.children ?? []);
      schema = { type: 'array', items: built.schema };
      if (Object.keys(built.uiSchema).length) uiSchema.items = built.uiSchema;
    } else {
      const item = widgetFieldSchema({ ...field, kind: itemKind });
      schema = { type: 'array', items: item.schema };
    }
    if (field.kind === 'dynamicTable') uiSchema['ui:options'] = { ...(uiSchema['ui:options'] as object), variant: 'table' };
  } else {
    const { schema: leafSchema, uiOptions } = widgetFieldSchema(field);
    schema = leafSchema;
    if (uiOptions.widget) uiSchema['ui:widget'] = uiOptions.widget;
    const opts: Record<string, unknown> = { ...(typeof uiOptions.options === 'object' ? uiOptions.options : {}) };
    if (uiOptions.expression !== undefined) opts.expression = uiOptions.expression;
    if (uiOptions.refs !== undefined) opts.refs = uiOptions.refs;
    if (uiOptions.lookupType !== undefined) opts.lookupType = uiOptions.lookupType;
    if (field.tooltip) opts.tooltip = field.tooltip;
    if (field.cssClass) uiSchema['ui:classNames'] = field.cssClass;
    if (field.validation?.customValidator) opts.customValidator = field.validation.customValidator;
    if (field.validation?.errorMessages) opts.errorMessages = field.validation.errorMessages;
    if (Object.keys(opts).length) uiSchema['ui:options'] = opts;
  }

  if (field.description) uiSchema['ui:help'] = field.description;
  if (field.helpText) uiSchema['ui:help'] = [uiSchema['ui:help'], field.helpText].filter(Boolean).join(' — ');
  if (field.placeholder) uiSchema['ui:placeholder'] = field.placeholder;
  if (field.readOnly) uiSchema['ui:readonly'] = true;
  if (field.disabled) uiSchema['ui:disabled'] = true;
  if (field.hidden) uiSchema['ui:widget'] = 'hidden';

  applyCommonSchemaProps(schema, field);
  return { schema, uiSchema };
}

function metadataLayoutNode(field: FieldDraft): LayoutNode {
  if (field.kind === 'heading') return { kind: 'heading', text: field.title };
  if (field.kind === 'paragraph') return { kind: 'paragraph', text: field.description ?? field.title };
  return { kind: 'divider' };
}

type CollectedRule = { targetKey: string; when: ConditionalRule['when']; action: ConditionalActionKind };

function collectRules(fields: FieldDraft[], out: CollectedRule[]) {
  for (const field of fields) {
    for (const rule of field.conditional ?? []) {
      for (const action of rule.actions) {
        out.push({ targetKey: action.target, when: rule.when, action: action.action });
      }
    }
    if (field.children?.length) collectRules(field.children, out);
  }
}

export function buildObjectSchema(fields: FieldDraft[]): { schema: RJSFSchema; uiSchema: UiSchema; layout: LayoutNode[] } {
  const properties: Record<string, RJSFSchema> = {};
  const required: string[] = [];
  const uiSchema: Record<string, unknown> = {};
  const order: string[] = [];
  const layout: LayoutNode[] = [];

  const allRules: CollectedRule[] = [];
  collectRules(fields, allRules);
  const rulesByTarget = new Map<string, CollectedRule[]>();
  for (const rule of allRules) {
    const list = rulesByTarget.get(rule.targetKey) ?? [];
    list.push(rule);
    rulesByTarget.set(rule.targetKey, list);
  }

  function attachConditional(key: string, ui: Record<string, unknown>) {
    const rules = rulesByTarget.get(key);
    if (!rules?.length) return;
    const opts = (ui['ui:options'] as Record<string, unknown>) ?? {};
    opts.conditional = rules.map((r) => ({ when: r.when, action: r.action }));
    ui['ui:options'] = opts;
  }

  function walk(list: FieldDraft[], target: LayoutNode[]) {
    for (const field of list) {
      if (METADATA_KINDS.includes(field.kind)) {
        target.push(metadataLayoutNode(field));
        continue;
      }
      if (LAYOUT_ONLY_KINDS.includes(field.kind)) {
        const children: LayoutNode[] = [];
        walk(field.children ?? [], children);
        if (field.kind === 'section') target.push({ kind: 'section', title: field.title, children });
        else target.push({ kind: 'card', title: field.title, children });
        continue;
      }
      if (PANEL_KINDS.includes(field.kind)) {
        const panels = (field.children ?? []).map((child) => {
          const panelChildren: LayoutNode[] = [];
          walk([child], panelChildren);
          return { title: child.title || child.key, children: panelChildren };
        });
        if (field.kind === 'accordion') target.push({ kind: 'accordion', title: field.title, panels });
        else target.push({ kind: 'tabs', title: field.title, panels });
        continue;
      }

      const { schema, uiSchema: fieldUi } = buildLeafOrContainerSchema(field);
      properties[field.key] = schema;
      order.push(field.key);
      if (field.required) required.push(field.key);
      attachConditional(field.key, fieldUi as Record<string, unknown>);
      if (Object.keys(fieldUi).length) uiSchema[field.key] = fieldUi;
      target.push({ kind: 'field', key: field.key, width: field.width });
    }
  }

  walk(fields, layout);
  uiSchema['ui:order'] = order;
  uiSchema['ui:layout'] = layout;

  const schema: RJSFSchema = {
    type: 'object',
    properties,
    ...(required.length ? { required } : {}),
  };

  return { schema, uiSchema, layout };
}

export function draftsToDefaultValues(fields: FieldDraft[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (METADATA_KINDS.includes(field.kind) || LAYOUT_ONLY_KINDS.includes(field.kind) || PANEL_KINDS.includes(field.kind)) {
      if (field.children?.length) Object.assign(values, draftsToDefaultValues(field.children));
      continue;
    }
    if (field.default !== undefined) values[field.key] = field.default;
    else if (field.kind === 'object' && field.children?.length) values[field.key] = draftsToDefaultValues(field.children);
  }
  return values;
}
