import { docToMarkdown, markdownToDoc } from './markdown';
import { docSchema } from './schema';

describe('markdown', () => {
  it('round-trips headings, marks, lists, blockquote, code block and hr', () => {
    const markdown = [
      '# Title',
      '',
      'Some **bold**, *em*, ~~strike~~ and `code` text with a [link](https://example.com).',
      '',
      '* one',
      '* two',
      '',
      '1. first',
      '',
      '> quoted',
      '',
      '```',
      'const x = 1;',
      '```',
      '',
      '---',
    ].join('\n');

    const doc = markdownToDoc(markdown);
    expect(docToMarkdown(doc)).toBe(markdown);
  });

  it('serializes an inline field token as {{fieldKey}} and parses it back', () => {
    const doc = docSchema.nodeFromJSON({
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
    });

    const markdown = docToMarkdown(doc);
    expect(markdown).toBe('Total due: {{amount}}');

    const parsed = markdownToDoc(markdown);
    expect(parsed.toJSON()).toEqual(doc.toJSON());
  });

  it('serializes a block field token as [[fieldKey]] on its own line and parses it back', () => {
    const doc = docSchema.nodeFromJSON({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Line items' }] },
        { type: 'field_block_token', attrs: { fieldKey: 'items' } },
      ],
    });

    const markdown = docToMarkdown(doc);
    expect(markdown).toBe('# Line items\n\n[[items]]');

    const parsed = markdownToDoc(markdown);
    expect(parsed.toJSON()).toEqual(doc.toJSON());
  });
});
