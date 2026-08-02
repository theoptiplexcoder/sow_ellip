'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@sow-platform/ui';
import { sowToHtml } from '@/lib/docx/sow-to-html';
import { generateDocxBlob } from '@/lib/docx/generate-docx';
import type { Sow } from '@/lib/data/sows';

const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[42rem] rounded-md border" />,
  },
);

export function SowDocumentViewer({ sow }: { sow: Sow }) {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateDocxBlob(sowToHtml(sow))
      .then((blob) => blob.arrayBuffer())
      .then((buf) => {
        if (!cancelled) setBuffer(buf);
      });
    return () => {
      cancelled = true;
    };
  }, [sow.id]);

  if (!buffer) {
    return <Skeleton className="h-[42rem] rounded-md border" />;
  }

  return (
    <DocxEditor
      documentBuffer={buffer}
      mode="suggesting"
      showZoomControl={false}
      documentName={sow.title}
      documentNameEditable={false}
      className="h-[42rem] rounded-md border"
    />
  );
}
