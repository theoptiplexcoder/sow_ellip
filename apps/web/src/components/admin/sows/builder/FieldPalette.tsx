'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { FIELD_CATEGORY_LABELS, FIELD_KIND_LABELS, FIELD_PALETTE, type FieldCategory, type FieldKind } from './types';

export const DRAG_KIND_MIME = 'application/x-sow-field-kind';

const CATEGORY_ORDER: FieldCategory[] = ['metadata', 'basic', 'advanced', 'enterprise', 'container', 'workflow', 'computed'];

export function FieldPalette({ onAdd }: { onAdd: (kind: FieldKind) => void }) {
  const [open, setOpen] = useState<Record<FieldCategory, boolean>>({
    metadata: true,
    basic: true,
    advanced: false,
    enterprise: false,
    container: true,
    workflow: false,
    computed: false,
  });

  return (
    <div className="space-y-3">
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="rounded-md border border-border">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent/40"
            onClick={() => setOpen((o) => ({ ...o, [category]: !o[category] }))}
          >
            {FIELD_CATEGORY_LABELS[category]}
            {open[category] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          {open[category] && (
            <div className="grid grid-cols-2 gap-1.5 p-2 pt-0">
              {FIELD_PALETTE[category].map((kind) => (
                <button
                  key={kind}
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData(DRAG_KIND_MIME, kind)}
                  onClick={() => onAdd(kind)}
                  className={cn(
                    'cursor-grab rounded-md border border-border bg-card px-2 py-1.5 text-left text-xs font-medium text-foreground',
                    'hover:border-primary/40 hover:bg-accent/40 active:cursor-grabbing',
                  )}
                >
                  {FIELD_KIND_LABELS[kind]}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
