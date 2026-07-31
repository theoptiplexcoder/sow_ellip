// Converts between the persisted `body` (plain ProseMirror doc JSON, as
// stored on a TemplateRow) and a live `docSchema` Node, using the field
// registry to sanitize dangling field tokens (a `field_token`/
// `field_block_token` whose `fieldKey` no longer exists in `fields`, e.g.
// after a field was deleted from the registry but not yet removed from the
// document).

import { Node } from 'prosemirror-model';
import { docSchema } from './schema';
import type { FieldDraft } from '../types';

export type DocJSON = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocJSON[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

export const EMPTY_DOC_JSON: DocJSON = { type: 'doc', content: [{ type: 'paragraph' }] };

function sanitize(node: DocJSON, fieldKeys: Set<string>): DocJSON | null {
  if (node.type === 'field_token' || node.type === 'field_block_token') {
    const fieldKey = node.attrs?.['fieldKey'];
    return typeof fieldKey === 'string' && fieldKeys.has(fieldKey) ? node : null;
  }
  if (!node.content) return node;
  const content = node.content
    .map((child) => sanitize(child, fieldKeys))
    .filter((child): child is DocJSON => child !== null);
  return { ...node, content };
}

/** Parses the stored `body` JSON into a live doc, dropping tokens for fields no longer in the registry. */
export function fieldsAndBodyToDoc(fields: FieldDraft[], body: DocJSON | null | undefined): Node {
  const fieldKeys = new Set(fields.map((f) => f.key));
  const sanitized = sanitize(body ?? EMPTY_DOC_JSON, fieldKeys) ?? EMPTY_DOC_JSON;
  if (sanitized.type === 'doc' && (!sanitized.content || sanitized.content.length === 0)) {
    sanitized.content = [{ type: 'paragraph' }];
  }
  return docSchema.nodeFromJSON(sanitized);
}

/** Serializes a live doc back to plain JSON for persistence. */
export function docToBody(doc: Node): DocJSON {
  return doc.toJSON() as DocJSON;
}
