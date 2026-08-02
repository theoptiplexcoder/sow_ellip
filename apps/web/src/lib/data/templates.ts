export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'table';

export interface TemplateField {
  id: string;
  label: string;
  type: TemplateFieldType;
  defaultValue?: string;
}

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Renders a field list as a document body — headings + placeholder tokens, tables for `type: 'table'` fields. */
function fieldsToHtml(fields: TemplateField[]): string {
  return fields
    .map((f) => {
      const token = `{{${slugify(f.label)}}}`;
      if (f.type === 'table') {
        return `<h2>${f.label}</h2><table><tr><th>Item</th><th>Value</th></tr><tr><td>${token}</td><td></td></tr></table>`;
      }
      return `<h2>${f.label}</h2><p>${f.defaultValue || token}</p>`;
    })
    .join('\n');
}

function fieldsToPlaceholders(fields: TemplateField[]): string[] {
  return fields.map((f) => `{{${slugify(f.label)}}}`);
}

/** Default fields used to seed a new blank template's starting document. */
export const DEFAULT_TEMPLATE_FIELDS: Array<Omit<TemplateField, 'id'>> = [
  { label: 'Title', type: 'text' },
  { label: 'SOW Number', type: 'text' },
  { label: 'Overview', type: 'textarea' },
  { label: 'Objectives', type: 'textarea' },
  { label: 'In Scope', type: 'textarea' },
  { label: 'Out of Scope', type: 'textarea' },
  { label: 'Deliverables', type: 'table' },
  { label: 'Milestones', type: 'table' },
  { label: 'Assumptions', type: 'textarea' },
  { label: 'Dependencies', type: 'textarea' },
  { label: 'Acceptance Criteria', type: 'textarea' },
  { label: 'Pricing', type: 'table' },
  { label: 'Payment Terms', type: 'textarea' },
  { label: 'Terms and Conditions', type: 'textarea' },
];

const seededDefaultFields: TemplateField[] = DEFAULT_TEMPLATE_FIELDS.map(
  (f, i) => ({ ...f, id: `default-${i}` }),
);

/** Seed body + placeholders used when creating a new blank template from `DEFAULT_TEMPLATE_FIELDS`. */
export const DEFAULT_DOCX_BODY_HTML = fieldsToHtml(seededDefaultFields);
export const DEFAULT_TEMPLATE_PLACEHOLDERS =
  fieldsToPlaceholders(seededDefaultFields);

export interface Template {
  id: string;
  name: string;
  version: number;
  updatedAt: string;
  status: 'active' | 'archived';
  /** Presence of placeholder tokens is what classifies a template as "Structured" vs "DOCX" in the UI — not a stored category. */
  placeholders: string[];
  bodyHtml: string;
  /** Path (under /public) to the stored .docx file, e.g. /uploads/172-file.docx. Undefined until first saved from the editor. */
  fileUrl?: string;
  versions: { version: number; uploadedAt: string; note: string }[];
}

/** A template counts as "structured" when its document has placeholder tokens for structured data to fill in. */
export function hasPlaceholders(template: Template) {
  return template.placeholders.length > 0;
}

const stmpl1Fields: TemplateField[] = [
  { id: 'f1', label: 'Objectives', type: 'textarea' },
  { id: 'f2', label: 'Period of Performance - Start', type: 'date' },
  { id: 'f3', label: 'Period of Performance - End', type: 'date' },
  { id: 'f4', label: 'Milestones', type: 'table' },
  { id: 'f5', label: 'Pricing', type: 'table' },
];

const stmpl2Fields: TemplateField[] = [
  { id: 'f1', label: 'Deliverables', type: 'table' },
  { id: 'f2', label: 'Acceptance Criteria', type: 'textarea' },
  { id: 'f3', label: 'Total Fixed Price', type: 'number', defaultValue: '0' },
];

const stmpl3Fields: TemplateField[] = [
  { id: 'f1', label: 'Hourly Rate', type: 'number' },
  { id: 'f2', label: 'Estimated Hours', type: 'number' },
];

export const templates: Template[] = [
  {
    id: 'tmpl-1',
    name: 'Standard Professional Services SOW',
    version: 4,
    updatedAt: '2026-06-02',
    status: 'active',
    bodyHtml: fieldsToHtml(stmpl1Fields),
    placeholders: fieldsToPlaceholders(stmpl1Fields),
    versions: [
      { version: 4, uploadedAt: '2026-06-02', note: 'Updated pricing table' },
    ],
  },
  {
    id: 'tmpl-2',
    name: 'Fixed-Bid Implementation SOW',
    version: 2,
    updatedAt: '2026-04-18',
    status: 'active',
    bodyHtml: fieldsToHtml(stmpl2Fields),
    placeholders: fieldsToPlaceholders(stmpl2Fields),
    versions: [
      { version: 2, uploadedAt: '2026-04-18', note: 'Added fixed-price field' },
    ],
  },
  {
    id: 'tmpl-3',
    name: 'Time & Materials SOW',
    version: 1,
    updatedAt: '2026-02-27',
    status: 'archived',
    bodyHtml: fieldsToHtml(stmpl3Fields),
    placeholders: fieldsToPlaceholders(stmpl3Fields),
    versions: [
      { version: 1, uploadedAt: '2026-02-27', note: 'Initial upload' },
    ],
  },
  {
    id: 'tmpl-4',
    name: 'Northwind SOW Letterhead.docx',
    version: 3,
    updatedAt: '2026-05-30',
    status: 'active',
    placeholders: [
      '{{client}}',
      '{{project}}',
      '{{scope}}',
      '{{pricing}}',
      '{{milestones}}',
      '{{signature_block}}',
    ],
    bodyHtml: `
      <h1>Northwind SOW Letterhead</h1>
      <p>Prepared for {{client}}</p>
      <p>Project: {{project}}</p>
      <h2>Scope</h2>
      <p>{{scope}}</p>
      <h2>Pricing</h2>
      <p>{{pricing}}</p>
      <h2>Milestones</h2>
      <p>{{milestones}}</p>
      <p>Signature: {{signature_block}}</p>
    `.trim(),
    versions: [
      { version: 3, uploadedAt: '2026-05-30', note: 'Updated logo + footer' },
      { version: 2, uploadedAt: '2026-03-11', note: 'Added milestones table' },
      { version: 1, uploadedAt: '2026-01-05', note: 'Initial upload' },
    ],
  },
  {
    id: 'tmpl-5',
    name: 'Executive Summary Cover Page.docx',
    version: 1,
    updatedAt: '2026-06-10',
    status: 'active',
    placeholders: [],
    bodyHtml: `
      <h1>Executive Summary</h1>
      <p>Prepared for Northwind Consulting clients.</p>
      <p>A concise, boilerplate cover page — no fill-in fields, ready to attach as-is.</p>
      <p>Prepared by the Northwind Delivery Team</p>
    `.trim(),
    versions: [
      { version: 1, uploadedAt: '2026-06-10', note: 'Initial upload' },
    ],
  },
];

export function getTemplate(id: string) {
  return templates.find((t) => t.id === id);
}

export function deleteTemplate(id: string) {
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return;
  templates.splice(index, 1);
}

export function createTemplate(
  name: string,
  bodyHtml: string = DEFAULT_DOCX_BODY_HTML,
  placeholders: string[] = [],
  fileUrl?: string,
): Template {
  const today = new Date().toISOString().slice(0, 10);
  const template: Template = {
    id: `tmpl-${Date.now()}`,
    name,
    version: 1,
    updatedAt: today,
    status: 'active',
    placeholders,
    bodyHtml,
    fileUrl,
    versions: [{ version: 1, uploadedAt: today, note: 'Initial upload' }],
  };
  templates.push(template);
  return template;
}

export function saveTemplate(
  id: string,
  bodyHtml: string,
  placeholders: string[],
  fileUrl?: string,
  note = 'Edited in product',
) {
  const template = getTemplate(id);
  if (!template) return;
  const today = new Date().toISOString().slice(0, 10);
  template.bodyHtml = bodyHtml;
  template.placeholders = placeholders;
  if (fileUrl) template.fileUrl = fileUrl;
  template.updatedAt = today;
  template.version += 1;
  template.versions = [
    { version: template.version, uploadedAt: today, note },
    ...template.versions,
  ];
}

export function renameTemplate(id: string, name: string) {
  const template = getTemplate(id);
  if (!template || !name.trim()) return;
  template.name = name.trim();
}
