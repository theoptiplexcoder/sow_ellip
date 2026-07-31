// Block-level node inserting a fixed "Approved By / Date" signature block.

import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    signatureBlock: {
      setSignatureBlock: () => ReturnType;
    };
  }
}

export const SignatureBlock = Node.create({
  name: 'signatureBlock',
  group: 'block',
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-signature-block]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-signature-block': '', class: 'signature-block' }),
      ['div', { class: 'signature-block-line' }, ['span', {}, 'Approved By'], ['span', { class: 'signature-block-rule' }]],
      ['div', { class: 'signature-block-line' }, ['span', {}, 'Date'], ['span', { class: 'signature-block-rule' }]],
    ];
  },

  renderText() {
    return 'Approved By: __________________\nDate: __________________';
  },

  addCommands() {
    return {
      setSignatureBlock:
        () =>
        ({ chain }) =>
          chain().insertContent({ type: this.name }).run(),
    };
  },
});
