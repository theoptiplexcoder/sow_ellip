// Converts between the docSchema doc and plain Markdown text, for the
// "Markdown source" raw-edit toggle in PMCanvas. Built on
// prosemirror-markdown (MarkdownParser/MarkdownSerializer) plus a local
// markdown-it instance.
//
// field_token/field_block_token are custom atoms markdown-it doesn't know
// about, so they're given plain-text placeholder syntax: `{{fieldKey}}`
// inline, `[[fieldKey]]` on its own line for a block token. A small custom
// inline rule recognizes the former on parse; the latter is recovered with
// a post-pass over top-level paragraphs (simpler than a markdown-it block
// rule). `comment_ref` isn't representable in plain text and is dropped by
// this conversion — it's not expected to round-trip through hand-edited
// markdown.

import MarkdownIt from 'markdown-it';
import { MarkdownParser, MarkdownSerializer, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { Fragment, Node } from 'prosemirror-model';
import { docSchema } from './schema';

const FIELD_TOKEN_RE = /^\{\{([a-zA-Z0-9_]+)\}\}/;
const FIELD_BLOCK_TOKEN_RE = /^\[\[([a-zA-Z0-9_]+)\]\]$/;

function fieldTokenRule(state: MarkdownIt.StateInline, silent: boolean): boolean {
  const match = FIELD_TOKEN_RE.exec(state.src.slice(state.pos));
  if (!match) return false;
  if (!silent) {
    const token = state.push('field_token', '', 0);
    token.content = match[1];
  }
  state.pos += match[0].length;
  return true;
}

function createMarkdownIt(): MarkdownIt {
  const md = new MarkdownIt('commonmark', { html: false });
  md.inline.ruler.enable(['strikethrough']);
  md.inline.ruler2.enable(['strikethrough']);
  md.inline.ruler.before('text', 'field_token', fieldTokenRule);
  return md;
}

const markdownParser = new MarkdownParser(docSchema, createMarkdownIt(), {
  blockquote: { block: 'blockquote' },
  paragraph: { block: 'paragraph' },
  list_item: { block: 'list_item' },
  bullet_list: { block: 'bullet_list' },
  ordered_list: {
    block: 'ordered_list',
    getAttrs: (tok) => ({ order: +(tok.attrGet('start') ?? '1') || 1 }),
  },
  heading: { block: 'heading', getAttrs: (tok) => ({ level: +tok.tag.slice(1) }) },
  code_block: { block: 'code_block', noCloseToken: true },
  fence: { block: 'code_block', noCloseToken: true },
  hr: { node: 'horizontal_rule' },
  field_token: { node: 'field_token', getAttrs: (tok) => ({ fieldKey: tok.content }) },
  em: { mark: 'em' },
  strong: { mark: 'strong' },
  s: { mark: 'strike' },
  code_inline: { mark: 'code', noCloseToken: true },
  link: {
    mark: 'link',
    getAttrs: (tok) => ({ href: tok.attrGet('href'), title: tok.attrGet('title') || null }),
  },
});

/** Turns any top-level paragraph containing only `[[fieldKey]]` into a field_block_token. */
function promoteFieldBlockTokens(doc: Node): Node {
  const children: Node[] = [];
  let changed = false;
  doc.forEach((child) => {
    if (child.type.name === 'paragraph' && child.childCount === 1) {
      const only = child.child(0);
      const match = only.isText ? FIELD_BLOCK_TOKEN_RE.exec(only.text ?? '') : null;
      if (match) {
        children.push(docSchema.nodes['field_block_token'].create({ fieldKey: match[1] }));
        changed = true;
        return;
      }
    }
    children.push(child);
  });
  return changed ? docSchema.nodes['doc'].createChecked(doc.attrs, Fragment.fromArray(children)) : doc;
}

const markdownSerializer = new MarkdownSerializer(
  {
    paragraph: defaultMarkdownSerializer.nodes['paragraph'],
    blockquote: defaultMarkdownSerializer.nodes['blockquote'],
    heading: defaultMarkdownSerializer.nodes['heading'],
    horizontal_rule: defaultMarkdownSerializer.nodes['horizontal_rule'],
    bullet_list: defaultMarkdownSerializer.nodes['bullet_list'],
    ordered_list: defaultMarkdownSerializer.nodes['ordered_list'],
    list_item: defaultMarkdownSerializer.nodes['list_item'],
    code_block: defaultMarkdownSerializer.nodes['code_block'],
    text: defaultMarkdownSerializer.nodes['text'],
    field_token(state, node) {
      state.write(`{{${node.attrs['fieldKey']}}}`);
    },
    field_block_token(state, node) {
      state.write(`[[${node.attrs['fieldKey']}]]`);
      state.closeBlock(node);
    },
  },
  {
    em: defaultMarkdownSerializer.marks['em'],
    strong: defaultMarkdownSerializer.marks['strong'],
    code: defaultMarkdownSerializer.marks['code'],
    link: defaultMarkdownSerializer.marks['link'],
    strike: { open: '~~', close: '~~', mixable: true },
  },
);

export function docToMarkdown(doc: Node): string {
  return markdownSerializer.serialize(doc);
}

export function markdownToDoc(text: string): Node {
  return promoteFieldBlockTokens(markdownParser.parse(text));
}
