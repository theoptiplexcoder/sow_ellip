'use client';

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  List,
  ListOrdered,
  Quote,
  Minus,
  SquareCode,
  Undo2,
  Redo2,
  FileCode,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { EditorView } from 'prosemirror-view';
import { setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { wrapInList } from 'prosemirror-schema-list';
import { undo, redo } from 'prosemirror-history';
import type { Command } from 'prosemirror-state';
import { docSchema } from './schema';
import { cn } from '../../../../lib/cn';

type EditorToolbarProps = {
  view: EditorView | null;
  /** Bumped by the parent on every transaction so active-state highlighting stays current. */
  stateVersion: number;
  mode: 'rich' | 'markdown';
  onToggleMode: () => void;
};

function runCommand(view: EditorView | null, command: Command) {
  if (!view) return;
  command(view.state, view.dispatch, view);
  view.focus();
}

function isMarkActive(view: EditorView, markName: string): boolean {
  const markType = docSchema.marks[markName];
  const { from, $from, to, empty } = view.state.selection;
  if (empty) return !!markType.isInSet(view.state.storedMarks ?? $from.marks());
  return view.state.doc.rangeHasMark(from, to, markType);
}

function isBlockActive(view: EditorView, nodeName: string, attrs?: Record<string, unknown>): boolean {
  const { $from } = view.state.selection;
  const node = $from.parent;
  if (node.type.name !== nodeName) return false;
  if (!attrs) return true;
  return Object.entries(attrs).every(([key, value]) => node.attrs[key] === value);
}

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded transition-colors disabled:pointer-events-none disabled:opacity-40',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ view, stateVersion, mode, onToggleMode }: EditorToolbarProps) {
  void stateVersion;
  const disabled = !view || mode !== 'rich';
  const headingLevel = view && isBlockActive(view, 'heading') ? String(view.state.selection.$from.parent.attrs['level']) : '0';

  function setHeading(level: string) {
    if (!view) return;
    if (level === '0') {
      runCommand(view, setBlockType(docSchema.nodes['paragraph']));
    } else {
      runCommand(view, setBlockType(docSchema.nodes['heading'], { level: Number(level) }));
    }
  }

  function insertLink() {
    if (!view || view.state.selection.empty) return;
    const url = window.prompt('URL');
    if (!url) return;
    runCommand(view, toggleMark(docSchema.marks['link'], { href: url }));
  }

  function insertHorizontalRule() {
    if (!view) return;
    const { tr } = view.state;
    view.dispatch(tr.replaceSelectionWith(docSchema.nodes['horizontal_rule'].create()));
    view.focus();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
      <select
        aria-label="Text style"
        disabled={disabled}
        value={headingLevel}
        onChange={(e) => setHeading(e.target.value)}
        className="h-7 rounded border border-border bg-background px-1.5 text-xs disabled:opacity-40"
      >
        <option value="0">Paragraph</option>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <option key={level} value={level}>
            Heading {level}
          </option>
        ))}
      </select>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        label="Bold"
        active={!!view && isMarkActive(view, 'strong')}
        disabled={disabled}
        onClick={() => runCommand(view, toggleMark(docSchema.marks['strong']))}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={!!view && isMarkActive(view, 'em')}
        disabled={disabled}
        onClick={() => runCommand(view, toggleMark(docSchema.marks['em']))}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={!!view && isMarkActive(view, 'strike')}
        disabled={disabled}
        onClick={() => runCommand(view, toggleMark(docSchema.marks['strike']))}
      >
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={!!view && isMarkActive(view, 'code')}
        disabled={disabled}
        onClick={() => runCommand(view, toggleMark(docSchema.marks['code']))}
      >
        <Code size={15} />
      </ToolbarButton>
      <ToolbarButton label="Link" disabled={disabled} onClick={insertLink}>
        <Link2 size={15} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        label="Bullet list"
        active={!!view && isBlockActive(view, 'bullet_list')}
        disabled={disabled}
        onClick={() => runCommand(view, wrapInList(docSchema.nodes['bullet_list']))}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        active={!!view && isBlockActive(view, 'ordered_list')}
        disabled={disabled}
        onClick={() => runCommand(view, wrapInList(docSchema.nodes['ordered_list']))}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        active={!!view && isBlockActive(view, 'blockquote')}
        disabled={disabled}
        onClick={() => runCommand(view, wrapIn(docSchema.nodes['blockquote']))}
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        active={!!view && isBlockActive(view, 'code_block')}
        disabled={disabled}
        onClick={() => runCommand(view, setBlockType(docSchema.nodes['code_block']))}
      >
        <SquareCode size={15} />
      </ToolbarButton>
      <ToolbarButton label="Horizontal rule" disabled={disabled} onClick={insertHorizontalRule}>
        <Minus size={15} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton label="Undo" disabled={disabled} onClick={() => runCommand(view, undo)}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={disabled} onClick={() => runCommand(view, redo)}>
        <Redo2 size={15} />
      </ToolbarButton>

      <div className="ml-auto">
        <ToolbarButton
          label={mode === 'rich' ? 'View Markdown source' : 'Back to rich text'}
          active={mode === 'markdown'}
          onClick={onToggleMode}
        >
          <FileCode size={15} />
        </ToolbarButton>
      </div>
    </div>
  );
}
