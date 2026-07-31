// "/" slash command menu: type "/" at the start of a line to insert a block.

import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import type { Editor, Range } from '@tiptap/core';

export type SlashCommandItem = {
  title: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
};

export const SLASH_COMMAND_ITEMS: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
  },
  {
    title: 'Table',
    description: 'Insert a 3x3 table',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: 'Checklist',
    description: 'Task list with checkboxes',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: 'Divider',
    description: 'Horizontal rule',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: 'Quote',
    description: 'Blockquote',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    title: 'Code block',
    description: 'Syntax-highlighted code',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: 'Page break',
    description: 'Force a page break on export',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setPageBreak().run(),
  },
  {
    title: 'Signature block',
    description: 'Approved By / Date lines',
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setSignatureBlock().run(),
  },
];

function renderSlashMenu(): SuggestionOptions<SlashCommandItem>['render'] {
  let el: HTMLDivElement | null = null;
  let items: SlashCommandItem[] = [];
  let selected = 0;
  let selectFn: ((item: SlashCommandItem) => void) | null = null;

  function draw() {
    if (!el) return;
    el.innerHTML = '';
    items.forEach((item, i) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `slash-menu-item${i === selected ? ' is-selected' : ''}`;
      row.innerHTML = `<span class="slash-menu-item-title">${item.title}</span><span class="slash-menu-item-desc">${item.description}</span>`;
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectFn?.(item);
      });
      el?.appendChild(row);
    });
  }

  function position(clientRect: (() => DOMRect | null) | null | undefined) {
    if (!el) return;
    const rect = clientRect?.();
    if (!rect) return;
    el.style.left = `${rect.left + window.scrollX}px`;
    el.style.top = `${rect.bottom + window.scrollY + 4}px`;
  }

  return () => ({
    onStart: (props) => {
      items = props.items;
      selected = 0;
      selectFn = (item) => props.command(item);
      el = document.createElement('div');
      el.className = 'slash-menu';
      document.body.appendChild(el);
      draw();
      position(props.clientRect);
    },
    onUpdate: (props) => {
      items = props.items;
      selected = 0;
      draw();
      position(props.clientRect);
    },
    onKeyDown: (props) => {
      if (props.event.key === 'Escape') {
        el?.remove();
        el = null;
        return true;
      }
      if (props.event.key === 'ArrowDown') {
        selected = (selected + 1) % Math.max(items.length, 1);
        draw();
        return true;
      }
      if (props.event.key === 'ArrowUp') {
        selected = (selected - 1 + items.length) % Math.max(items.length, 1);
        draw();
        return true;
      }
      if (props.event.key === 'Enter') {
        if (items[selected]) selectFn?.(items[selected]);
        return true;
      }
      return false;
    },
    onExit: () => {
      el?.remove();
      el = null;
    },
  });
}

export interface SlashCommandsOptions {
  suggestion: Omit<SuggestionOptions<SlashCommandItem>, 'editor'>;
}

export const SlashCommands = Extension.create<SlashCommandsOptions>({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }: { query: string }) =>
          SLASH_COMMAND_ITEMS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10),
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
          props.command({ editor, range });
        },
        render: renderSlashMenu(),
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
