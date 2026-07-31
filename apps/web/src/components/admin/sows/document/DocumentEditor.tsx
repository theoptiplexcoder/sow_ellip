'use client';

import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import ImageExtension from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  CheckSquare,
  Columns3,
  FileSignature,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  ListTree,
  Lock,
  LockOpen,
  PanelRight,
  Quote,
  Redo2,
  Rows3,
  ScissorsLineDashed,
  Search,
  Strikethrough,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../../../../lib/cn';
import { FontSize } from './fontSize';
import { PlaceholderVariable } from './placeholderVariable';
import { PageBreak } from './pageBreak';
import { SignatureBlock } from './signatureBlock';
import { SlashCommands } from './slashCommands';
import { SearchAndReplace } from './searchAndReplace';
import { DocumentOutline } from './DocumentOutline';
import { SearchReplacePanel } from './SearchReplacePanel';

type DocumentEditorProps = {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
};

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32'];

const lowlight = createLowlight(common);

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

export function DocumentEditor({ content, onChange }: DocumentEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOutline, setShowOutline] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Typography,
      Placeholder.configure({ placeholder: 'Type "/" for commands, or start typing…' }),
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      ImageExtension,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      PlaceholderVariable,
      PageBreak,
      SignatureBlock,
      SlashCommands,
      SearchAndReplace,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: 'prose min-h-[500px] max-w-none p-6 focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  const headingLevel = [1, 2, 3].find((level) => editor.isActive('heading', { level }));
  const readOnly = !editor.isEditable;

  function handleImageButtonClick() {
    fileInputRef.current?.click();
  }

  function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (typeof src === 'string') {
        editor.chain().focus().setImage({ src }).run();
      }
    };
    reader.readAsDataURL(file);
  }

  function handleLinkButtonClick() {
    if (!editor) return;
    const existing = editor.getAttributes('link')['href'] as string | undefined;
    const url = window.prompt('Link URL', existing ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  function handleInsertVariable() {
    if (!editor) return;
    const key = window.prompt('Variable name (e.g. client_name)');
    if (!key) return;
    editor.chain().focus().insertPlaceholderVariable(key.trim()).run();
  }

  const inTable = editor.isActive('table');

  return (
    <div className="flex gap-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-border bg-background focus-within:ring-1 focus-within:ring-ring">
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
            <select
              aria-label="Text style"
              value={headingLevel ?? '0'}
              onChange={(e) => {
                const level = e.target.value;
                if (level === '0') editor.chain().focus().setParagraph().run();
                else editor.chain().focus().toggleHeading({ level: Number(level) as 1 | 2 | 3 }).run();
              }}
              className="h-7 rounded border border-border bg-background px-1.5 text-xs"
            >
              <option value="0">Paragraph</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>

            <select
              aria-label="Font family"
              value={editor.getAttributes('textStyle')['fontFamily'] ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) editor.chain().focus().unsetFontFamily().run();
                else editor.chain().focus().setFontFamily(value).run();
              }}
              className="h-7 rounded border border-border bg-background px-1.5 text-xs"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Font size"
              value={(editor.getAttributes('textStyle')['fontSize'] as string | null)?.replace('px', '') ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) editor.chain().focus().unsetFontSize().run();
                else editor.chain().focus().setFontSize(`${value}px`).run();
              }}
              className="h-7 rounded border border-border bg-background px-1.5 text-xs"
            >
              <option value="">Size</option>
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <input
              aria-label="Text color"
              type="color"
              value={(editor.getAttributes('textStyle')['color'] as string | undefined) ?? '#000000'}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="h-7 w-7 cursor-pointer rounded border border-border bg-background p-0.5"
            />

            <div className="mx-1 h-5 w-px bg-border" />

            <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold size={15} />
            </ToolbarButton>
            <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Underline"
              active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Strikethrough"
              active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Highlight"
              active={editor.isActive('highlight')}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter size={15} />
            </ToolbarButton>
            <ToolbarButton label="Link" active={editor.isActive('link')} onClick={handleLinkButtonClick}>
              <Link2 size={15} />
            </ToolbarButton>

            <div className="mx-1 h-5 w-px bg-border" />

            <ToolbarButton
              label="Align left"
              active={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Align center"
              active={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Align right"
              active={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight size={15} />
            </ToolbarButton>

            <div className="mx-1 h-5 w-px bg-border" />

            <ToolbarButton
              label="Bullet list"
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Ordered list"
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Task list"
              active={editor.isActive('taskList')}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <CheckSquare size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Blockquote"
              active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Code block"
              active={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Braces size={15} />
            </ToolbarButton>

            <div className="mx-1 h-5 w-px bg-border" />

            <ToolbarButton label="Insert image" onClick={handleImageButtonClick}>
              <ImageIcon size={15} />
            </ToolbarButton>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />

            <ToolbarButton
              label="Insert table"
              active={inTable}
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              <Table2 size={15} />
            </ToolbarButton>

            {inTable && (
              <>
                <ToolbarButton label="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>
                  <Rows3 size={15} />
                </ToolbarButton>
                <ToolbarButton label="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                  <Columns3 size={15} />
                </ToolbarButton>
                <ToolbarButton label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
                  <Trash2 size={15} />
                </ToolbarButton>
              </>
            )}

            <div className="mx-1 h-5 w-px bg-border" />

            <ToolbarButton label="Insert variable" onClick={handleInsertVariable}>
              <Braces size={15} />
            </ToolbarButton>
            <ToolbarButton label="Insert page break" onClick={() => editor.chain().focus().setPageBreak().run()}>
              <ScissorsLineDashed size={15} />
            </ToolbarButton>
            <ToolbarButton label="Insert signature block" onClick={() => editor.chain().focus().setSignatureBlock().run()}>
              <FileSignature size={15} />
            </ToolbarButton>

            <div className="mx-1 h-5 w-px bg-border" />

            <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
              <Undo2 size={15} />
            </ToolbarButton>
            <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
              <Redo2 size={15} />
            </ToolbarButton>

            <div className="ml-auto flex items-center gap-1">
              <ToolbarButton label="Find and replace" active={showSearch} onClick={() => setShowSearch((v) => !v)}>
                <Search size={15} />
              </ToolbarButton>
              <ToolbarButton label="Document outline" active={showOutline} onClick={() => setShowOutline((v) => !v)}>
                <PanelRight size={15} />
              </ToolbarButton>
              <ToolbarButton label="Make read-only" onClick={() => editor.setEditable(false)}>
                <Lock size={15} />
              </ToolbarButton>
            </div>
          </div>
        )}

        {readOnly && (
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-2 py-1.5">
            <span className="text-xs text-muted-foreground">Read-only</span>
            <ToolbarButton label="Enable editing" onClick={() => editor.setEditable(true)}>
              <LockOpen size={15} />
            </ToolbarButton>
          </div>
        )}

        {showSearch && !readOnly && <SearchReplacePanel editor={editor} onClose={() => setShowSearch(false)} />}

        {editor.isEditable && (
          <BubbleMenu editor={editor} className="flex items-center gap-0.5 rounded-md border border-border bg-card p-1 shadow-md">
            <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold size={15} />
            </ToolbarButton>
            <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Underline"
              active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon size={15} />
            </ToolbarButton>
            <ToolbarButton label="Link" active={editor.isActive('link')} onClick={handleLinkButtonClick}>
              <Link2 size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Highlight"
              active={editor.isActive('highlight')}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter size={15} />
            </ToolbarButton>
          </BubbleMenu>
        )}

        {editor.isEditable && (
          <FloatingMenu editor={editor} className="flex items-center gap-0.5 rounded-md border border-border bg-card p-1 shadow-md">
            <ToolbarButton
              label="Heading 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              label="Insert table"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              <Table2 size={15} />
            </ToolbarButton>
            <ToolbarButton label="Task list" onClick={() => editor.chain().focus().toggleTaskList().run()}>
              <ListChecks size={15} />
            </ToolbarButton>
          </FloatingMenu>
        )}

        <EditorContent editor={editor} />

        <div className="flex items-center justify-end border-t border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          {editor.storage.characterCount.words()} words · {editor.storage.characterCount.characters()} characters
        </div>
      </div>

      {showOutline && (
        <div className="w-56 shrink-0 overflow-y-auto rounded-md border border-border bg-background">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-xs font-medium text-foreground">
            <ListTree size={14} />
            Outline
          </div>
          <DocumentOutline editor={editor} />
        </div>
      )}
    </div>
  );
}
