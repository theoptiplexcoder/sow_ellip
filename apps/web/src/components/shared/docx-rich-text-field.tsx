'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Label, Skeleton } from '@sow-platform/ui';
import { generateDocxBlob } from '@/lib/docx/generate-docx';

const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[28rem] rounded-md border" />,
  },
);

export function DocxRichTextField({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateDocxBlob(defaultValue)
      .then((blob) => blob.arrayBuffer())
      .then((buf) => {
        if (!cancelled) setBuffer(buf);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {buffer ? (
        <DocxEditor
          documentBuffer={buffer}
          mode="editing"
          showFileOpen={false}
          showHelpMenu={false}
          showZoomControl={false}
          showRuler={false}
          showOutlineButton={false}
          className="h-[28rem] rounded-md border"
        />
      ) : (
        <Skeleton className="h-[28rem] rounded-md border" />
      )}
    </div>
  );
}
