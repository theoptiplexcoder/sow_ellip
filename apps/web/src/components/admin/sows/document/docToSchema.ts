// Converts a typed Tiptap document into the { jsonSchema, uiSchema,
// defaultValues } shape (SchemaOverride) the rest of the SOW app already
// consumes (LivePreview, participant form rendering, sowStore).
//
// Each heading starts a new schema field (key = slugified heading text,
// title = heading text); the paragraphs/lists that follow it, up to the
// next heading, become that field's default text value. Content typed
// before the first heading is bucketed under an implicit "Introduction"
// field.

import type { JSONContent } from '@tiptap/core';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import type { SchemaOverride } from '../templateStore';

export const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base || 'field';
}

function extractText(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  if (node.type === 'placeholderVariable') return `{{${node.attrs?.['key'] ?? ''}}}`;
  if (!node.content) return '';
  return node.content.map(extractText).join('');
}

function blockToText(node: JSONContent): string {
  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return (node.content ?? []).map((item: JSONContent) => `- ${extractText(item)}`).join('\n');
  }
  if (node.type === 'taskList') {
    return (node.content ?? [])
      .map((item: JSONContent) => `- [${item.attrs?.['checked'] ? 'x' : ' '}] ${extractText(item)}`)
      .join('\n');
  }
  if (node.type === 'table') {
    return (node.content ?? [])
      .map((row: JSONContent) => (row.content ?? []).map((cell: JSONContent) => extractText(cell)).join(' | '))
      .join('\n');
  }
  return extractText(node).trim();
}

export function docToSchemaOverride(doc: JSONContent): SchemaOverride {
  const blocks = doc.content ?? [];
  const properties: Record<string, RJSFSchema> = {};
  const uiSchema: UiSchema = {};
  const defaultValues: Record<string, unknown> = {};
  const usedKeys = new Set<string>();

  let currentKey: string | null = null;
  let currentLines: string[] = [];

  function startField(title: string) {
    let key = slugify(title);
    let i = 2;
    while (usedKeys.has(key)) key = `${slugify(title)}_${i++}`;
    usedKeys.add(key);
    properties[key] = { type: 'string', title };
    currentKey = key;
    currentLines = [];
  }

  function flush() {
    if (currentKey === null) return;
    const text = currentLines.filter(Boolean).join('\n\n');
    defaultValues[currentKey] = text;
    const lineCount = text.split('\n').length;
    uiSchema[currentKey] = {
      'ui:widget': 'textarea',
      'ui:options': { rows: Math.min(Math.max(lineCount + 1, 3), 20) },
    };
  }

  for (const block of blocks) {
    if (block.type === 'heading') {
      flush();
      startField(extractText(block).trim() || 'Untitled');
      continue;
    }
    if (currentKey === null) startField('Introduction');
    const text = blockToText(block);
    if (text) currentLines.push(text);
  }
  flush();

  return {
    jsonSchema: { type: 'object', properties },
    uiSchema,
    defaultValues,
  };
}
