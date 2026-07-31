// Inline atom node for SOW template variables, e.g. {{client_name}}.
// Rendered as a pill in the editor; serializes to plain "{{key}}" text so
// docToSchemaOverride and PDF export see the literal placeholder syntax.

import { Node, mergeAttributes } from '@tiptap/core';

export interface PlaceholderVariableOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    placeholderVariable: {
      insertPlaceholderVariable: (key: string) => ReturnType;
    };
  }
}

export const PlaceholderVariable = Node.create<PlaceholderVariableOptions>({
  name: 'placeholderVariable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      key: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-key'),
        renderHTML: (attrs) => ({ 'data-key': attrs.key }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-placeholder-variable]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-placeholder-variable': '',
        class: 'placeholder-variable',
      }),
      `{{${node.attrs.key}}}`,
    ];
  },

  renderText({ node }) {
    return `{{${node.attrs.key}}}`;
  },

  addCommands() {
    return {
      insertPlaceholderVariable:
        (key: string) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs: { key } }).run(),
    };
  },
});
