import { fieldsAndBodyToDoc, docToBody, EMPTY_DOC_JSON, type DocJSON } from './docConvert';
import type { FieldDraft } from '../types';

function field(key: string, kind: FieldDraft['kind'] = 'text'): FieldDraft {
  return { key, kind, title: key, required: false, readOnly: false, width: '100' };
}

describe('docConvert', () => {
  it('round-trips a doc with an inline field token', () => {
    const fields = [field('amount', 'currency')];
    const body: DocJSON = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Total due: ' },
            { type: 'field_token', attrs: { fieldKey: 'amount' } },
          ],
        },
      ],
    };

    const doc = fieldsAndBodyToDoc(fields, body);
    expect(docToBody(doc)).toEqual(body);
  });

  it('round-trips a doc with a block field token', () => {
    const fields = [field('items', 'dynamicTable')];
    const body: DocJSON = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Line items' }] },
        { type: 'field_block_token', attrs: { fieldKey: 'items' } },
      ],
    };

    const doc = fieldsAndBodyToDoc(fields, body);
    expect(docToBody(doc)).toEqual(body);
  });

  it('round-trips a comment_ref mark over a text range', () => {
    const fields: FieldDraft[] = [];
    const body: DocJSON = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'flagged text',
              marks: [{ type: 'comment_ref', attrs: { threadId: 'thread-1' } }],
            },
          ],
        },
      ],
    };

    const doc = fieldsAndBodyToDoc(fields, body);
    expect(docToBody(doc)).toEqual(body);
  });

  it('drops an inline field token whose fieldKey is no longer in the registry', () => {
    const fields: FieldDraft[] = [];
    const body: DocJSON = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Total due: ' },
            { type: 'field_token', attrs: { fieldKey: 'amount' } },
          ],
        },
      ],
    };

    const doc = fieldsAndBodyToDoc(fields, body);
    expect(docToBody(doc)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Total due: ' }] }],
    });
  });

  it('drops a block field token whose fieldKey is no longer in the registry, falling back to an empty paragraph if nothing remains', () => {
    const fields: FieldDraft[] = [];
    const body: DocJSON = {
      type: 'doc',
      content: [{ type: 'field_block_token', attrs: { fieldKey: 'items' } }],
    };

    const doc = fieldsAndBodyToDoc(fields, body);
    expect(docToBody(doc)).toEqual(EMPTY_DOC_JSON);
  });

  it('falls back to an empty doc when body is null/undefined', () => {
    expect(docToBody(fieldsAndBodyToDoc([], null))).toEqual(EMPTY_DOC_JSON);
    expect(docToBody(fieldsAndBodyToDoc([], undefined))).toEqual(EMPTY_DOC_JSON);
  });

  it('round-trips markdown-shortcut-produced nodes/marks (bullet list, ordered list, blockquote, strong, em)', () => {
    const body: DocJSON = {
      type: 'doc',
      content: [
        {
          type: 'bullet_list',
          content: [
            { type: 'list_item', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] }] },
            { type: 'list_item', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'two' }] }] },
          ],
        },
        {
          type: 'ordered_list',
          attrs: { order: 1 },
          content: [
            { type: 'list_item', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'first' }] }] },
          ],
        },
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'quoted' }] }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'bold', marks: [{ type: 'strong' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'em' }] },
          ],
        },
      ],
    };

    const doc = fieldsAndBodyToDoc([], body);
    expect(docToBody(doc)).toEqual(body);
  });
});
