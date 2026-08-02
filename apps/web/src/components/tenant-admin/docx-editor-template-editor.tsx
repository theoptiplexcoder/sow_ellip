'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { toast } from 'sonner';
import type { DocxEditorRef } from '@eigenpal/docx-editor-react';
import { FileDown, FileText, X } from 'lucide-react';
import { Badge, Button, Input, Separator, Skeleton } from '@sow-platform/ui';
import { generateDocxBlob, downloadBlob } from '@/lib/docx/generate-docx';
import { parseDocxFile } from '@/lib/docx/parse-docx';
import { renameTemplate, saveTemplate } from '@/lib/data/templates';

const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[36rem] rounded-md border" />,
  },
);

export function DocxEditorTemplateEditor({
  templateId,
  name,
  fileUrl,
  bodyHtml,
  placeholders: initialPlaceholders,
}: {
  templateId: string;
  name: string;
  fileUrl?: string;
  bodyHtml: string;
  placeholders: string[];
}) {
  const editorRef = useRef<DocxEditorRef>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [placeholders, setPlaceholders] = useState(initialPlaceholders);
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [saving, setSaving] = useState(false);
  const [docName, setDocName] = useState(name);

  useEffect(() => {
    let cancelled = false;
    const load = fileUrl
      ? fetch(fileUrl).then((res) => res.arrayBuffer())
      : generateDocxBlob(bodyHtml).then((blob) => blob.arrayBuffer());
    load.then((buf) => {
      if (!cancelled) setBuffer(buf);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function insertPlaceholder(token: string) {
    const view = editorRef.current?.getEditorRef()?.getView();
    if (!view) return;
    const { state, dispatch } = view;
    dispatch(
      state.tr.insertText(token, state.selection.from, state.selection.to),
    );
    view.focus();
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

  async function handleSave() {
    const buf = await editorRef.current?.save();
    if (!buf) return;
    setSaving(true);
    try {
      const file = new File([buf], docName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const [{ html, placeholders: detected }, uploadRes] = await Promise.all([
        parseDocxFile(file),
        fetch('/api/templates/upload', {
          method: 'POST',
          body: (() => {
            const formData = new FormData();
            formData.set('file', file);
            return formData;
          })(),
        }).then((res) => {
          if (!res.ok) throw new Error('Upload failed');
          return res.json() as Promise<{ url: string }>;
        }),
      ]);
      const mergedPlaceholders = Array.from(
        new Set([...placeholders, ...detected]),
      );
      await saveTemplate(templateId, html, mergedPlaceholders, uploadRes.url);
      toast.success('Template saved');
    } catch {
      toast.error(
        'Could not save template — check the connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleExportDocx() {
    const buf = await editorRef.current?.save();
    if (!buf) return;
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    downloadBlob(blob, docName.replace(/\.docx$/i, '') + '.docx');
    toast.success('DOCX downloaded');
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div>
        {buffer ? (
          <DocxEditor
            ref={editorRef}
            documentBuffer={buffer}
            mode="editing"
            showZoomControl={false}
            documentName={docName}
            documentNameEditable
            onDocumentNameChange={(next) => {
              setDocName(next);
              void renameTemplate(templateId, next);
            }}
            className="h-[36rem] rounded-md border"
          />
        ) : (
          <Skeleton className="h-[36rem] rounded-md border" />
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={`/tenant-admin/templates/${templateId}/print`}
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Template'}
          </Button>
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
        <Separator />
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewPlaceholder(e.target.value)
            }
            placeholder="client_name"
            className="h-7 text-xs"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
