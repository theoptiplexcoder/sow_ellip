'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
  Bold,
  FileDown,
  FileText,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Table as TableIcon,
  Undo2,
  X,
} from 'lucide-react';
import { Badge, Button, Input, Separator } from '@sow-platform/ui';
import { downloadBlob, generateDocxBlob } from '@/lib/docx/generate-docx';
import { saveTemplate } from '@/lib/data/templates';

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      size="icon"
      className="size-7"
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon className="size-3.5" />
    </Button>
  );
}

export function DocxFileEditor({
  templateId,
  name,
  bodyHtml,
  placeholders: initialPlaceholders,
}: {
  templateId: string;
  name: string;
  bodyHtml: string;
  placeholders: string[];
}) {
  const [placeholders, setPlaceholders] = useState(initialPlaceholders);
  const [newPlaceholder, setNewPlaceholder] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: bodyHtml,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[24rem]',
      },
    },
  });

  function insertPlaceholder(token: string) {
    editor?.chain().focus().insertContent(token).run();
  }

  function addPlaceholder() {
    const token = newPlaceholder.trim();
    if (!token) return;
    const normalized = token.startsWith('{{') ? token : `{{${token}}}`;
    if (!placeholders.includes(normalized)) {
      setPlaceholders((prev) => [...prev, normalized]);
    }
    setNewPlaceholder('');
  }

  function removePlaceholder(token: string) {
    setPlaceholders((prev) => prev.filter((p) => p !== token));
  }

  function handleSave() {
    if (!editor) return;
    saveTemplate(templateId, editor.getHTML(), placeholders);
    toast.success('Template saved');
  }

  async function handleExportDocx() {
    if (!editor) return;
    const blob = await generateDocxBlob(editor.getHTML());
    downloadBlob(blob, `${name.replace(/\.docx$/i, '')}.docx`);
    toast.success('DOCX downloaded');
  }

  if (!editor) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-1.5">
          <ToolbarButton
            icon={Undo2}
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo2}
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <ToolbarButton
            icon={Bold}
            label="Bold"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            icon={Italic}
            label="Italic"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <ToolbarButton
            icon={Heading1}
            label="Heading 1"
            active={editor.isActive('heading', { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          />
          <ToolbarButton
            icon={Heading2}
            label="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <ToolbarButton
            icon={List}
            label="Bullet list"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={ListOrdered}
            label="Numbered list"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <ToolbarButton
            icon={TableIcon}
            label="Insert table"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
                .run()
            }
          />
        </div>

        <div className="rounded-md border bg-card p-8 shadow-sm">
          <EditorContent editor={editor} />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={`/tenant-admin/templates/docx/${templateId}/print`}
                target="_blank"
              />
            }
          >
            <FileDown className="size-4" />
            Export to PDF
          </Button>
          <Button variant="outline" onClick={handleExportDocx}>
            <FileText className="size-4" />
            Export as DOCX
          </Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="mb-2 text-sm font-medium">Placeholders</div>
          <p className="mb-2 text-xs text-muted-foreground">
            Detected from the uploaded file, or added manually. Insert one at
            the cursor position.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          {placeholders.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No placeholders yet.
            </p>
          )}
          {placeholders.map((p) => (
            <div key={p} className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="flex-1 cursor-pointer justify-start truncate font-mono text-[10px]"
                onClick={() => insertPlaceholder(p)}
              >
                {p}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-destructive"
                aria-label="Remove placeholder"
                onClick={() => removePlaceholder(p)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            value={newPlaceholder}
            onChange={(e) => setNewPlaceholder(e.target.value)}
            placeholder="client_name"
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              addPlaceholder();
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            type="button"
            onClick={addPlaceholder}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
