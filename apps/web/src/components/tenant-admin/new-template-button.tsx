'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@sow-platform/ui';
import {
  DEFAULT_DOCX_BODY_HTML,
  DEFAULT_TEMPLATE_PLACEHOLDERS,
  Template,
  createTemplate,
} from '@/lib/data/templates';
import { generateDocxBlob } from '@/lib/docx/generate-docx';

export function NewTemplateButton({
  onCreated,
}: {
  onCreated?: (template: Template) => void;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleClick() {
    setCreating(true);
    try {
      const name = 'Untitled Template';
      const blob = await generateDocxBlob(DEFAULT_DOCX_BODY_HTML);
      const formData = new FormData();
      formData.set(
        'file',
        new File([blob], `${name}.docx`, { type: blob.type }),
      );

      const res = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const uploadRes = (await res.json()) as { url: string };

      const template = await createTemplate(
        name,
        DEFAULT_DOCX_BODY_HTML,
        DEFAULT_TEMPLATE_PLACEHOLDERS,
        uploadRes.url,
      );
      if (onCreated) {
        onCreated(template);
      } else {
        router.push(`/tenant-admin/templates/${template.id}`);
      }
    } catch {
      toast.error('Could not create template — try again.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={creating}>
      <Plus className="size-4" />
      {creating ? 'Creating…' : 'New Template'}
    </Button>
  );
}
