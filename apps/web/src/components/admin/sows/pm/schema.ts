// ProseMirror schema for the SOW template authoring/fill document.
//
// `field_token` is an inline atom for scalar fields (text, date, currency,
// etc.) that sit inside a paragraph/heading alongside real text, e.g.
// "Total due: [Amount]". `field_block_token` is a block atom for fields that
// don't fit inline (array, dynamicTable, signature, ...). Both only carry a
// `fieldKey` — no duplicated field config, which lives in the `FieldDraft`
// registry (see `../types.ts`).
//
// `comment_ref` is a mark (not a node) so it can wrap arbitrary text ranges
// or a single `field_token` to anchor a comment thread.
//
// Markdown typing shortcuts (see `markdownInputRules.ts`) rely on the marks/
// nodes below — the doc is still stored as ProseMirror JSON, typing
// "**bold**"/"# "/"- " etc. is just a convenient input method that produces
// the same node/mark structure as the toolbar would. `pm/markdown.ts`
// additionally serializes/parses this schema to/from plain Markdown text
// for the raw-source editing mode.

import { Schema, type NodeSpec } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import OrderedMap from 'orderedmap';

const baseNodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },

  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0],
  },

  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ],
    toDOM: (node: import('prosemirror-model').Node) => [`h${node.attrs.level}`, 0],
  },

  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: () => ['blockquote', 0],
  },

  code_block: {
    content: 'text*',
    group: 'block',
    code: true,
    defining: true,
    marks: '',
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM: () => ['pre', ['code', 0]],
  },

  horizontal_rule: {
    group: 'block',
    atom: true,
    parseDOM: [{ tag: 'hr' }],
    toDOM: () => ['hr'],
  },
};

const nodesWithLists = addListNodes(OrderedMap.from(baseNodes), 'paragraph block*', 'block');

export const docSchema = new Schema({
  nodes: nodesWithLists.append({
    field_block_token: {
      attrs: { fieldKey: {} },
      group: 'block',
      atom: true,
      parseDOM: [
        {
          tag: 'div[data-field-block-token]',
          getAttrs: (dom) => ({ fieldKey: (dom as HTMLElement).getAttribute('data-field-key') }),
        },
      ],
      toDOM: (node) => [
        'div',
        { 'data-field-block-token': 'true', 'data-field-key': node.attrs.fieldKey },
      ],
    },

    field_token: {
      attrs: { fieldKey: {} },
      group: 'inline',
      inline: true,
      atom: true,
      parseDOM: [
        {
          tag: 'span[data-field-token]',
          getAttrs: (dom) => ({ fieldKey: (dom as HTMLElement).getAttribute('data-field-key') }),
        },
      ],
      toDOM: (node) => [
        'span',
        { 'data-field-token': 'true', 'data-field-key': node.attrs.fieldKey },
      ],
    },

    text: { group: 'inline' },
  }),

  marks: {
    strong: {
      parseDOM: [{ tag: 'strong' }, { tag: 'b' }, { style: 'font-weight=bold' }],
      toDOM: () => ['strong', 0],
    },

    em: {
      parseDOM: [{ tag: 'em' }, { tag: 'i' }, { style: 'font-style=italic' }],
      toDOM: () => ['em', 0],
    },

    code: {
      parseDOM: [{ tag: 'code' }],
      toDOM: () => ['code', 0],
    },

    strike: {
      parseDOM: [{ tag: 's' }, { tag: 'del' }, { style: 'text-decoration=line-through' }],
      toDOM: () => ['s', 0],
    },

    link: {
      attrs: { href: {}, title: { default: null } },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (dom) => ({
            href: (dom as HTMLElement).getAttribute('href'),
            title: (dom as HTMLElement).getAttribute('title'),
          }),
        },
      ],
      toDOM: (mark) => ['a', { href: mark.attrs.href, title: mark.attrs.title }, 0],
    },

    comment_ref: {
      attrs: { threadId: {} },
      inclusive: true,
      parseDOM: [
        {
          tag: 'span[data-comment-ref]',
          getAttrs: (dom) => ({ threadId: (dom as HTMLElement).getAttribute('data-thread-id') }),
        },
      ],
      toDOM: (mark) => [
        'span',
        { 'data-comment-ref': 'true', 'data-thread-id': mark.attrs.threadId },
        0,
      ],
    },
  },
});
