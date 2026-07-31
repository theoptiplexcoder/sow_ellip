'use client';

import { Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu';
import type { FieldKind } from './types';

type Category = 'basic' | 'advanced' | 'enterprise' | 'container' | 'workflow' | 'computed';

const CATEGORY_LABELS: Record<Category, string> = {
  basic: 'Basic',
  advanced: 'Advanced',
  enterprise: 'Enterprise',
  container: 'Container',
  workflow: 'Workflow',
  computed: 'Computed',
};

const PALETTE: Record<Category, { kind: FieldKind; label: string }[]> = {
  basic: [
    { kind: 'text', label: 'Text' },
    { kind: 'textarea', label: 'Textarea' },
    { kind: 'number', label: 'Number' },
    { kind: 'date', label: 'Date' },
    { kind: 'email', label: 'Email' },
    { kind: 'checkbox', label: 'Checkbox' },
    { kind: 'select', label: 'Select' },
  ],
  advanced: [
    { kind: 'currency', label: 'Currency' },
    { kind: 'phone', label: 'Phone' },
    { kind: 'address', label: 'Address' },
    { kind: 'file', label: 'File Upload' },
  ],
  enterprise: [
    { kind: 'clientLookup', label: 'Client Lookup' },
    { kind: 'vendor', label: 'Vendor' },
  ],
  container: [
    { kind: 'object', label: 'Object' },
    { kind: 'array', label: 'Array' },
    { kind: 'dynamicTable', label: 'Dynamic Table' },
  ],
  workflow: [
    { kind: 'signature', label: 'Signature' },
    { kind: 'approval', label: 'Approval' },
    { kind: 'status', label: 'Status' },
  ],
  computed: [{ kind: 'formula', label: 'Formula' }],
};

type FieldPaletteProps = {
  onAddKind: (kind: FieldKind) => void;
};

/** Icon-triggered menu for inserting a new field token at the canvas cursor. */
export function FieldPalette({ onAddKind }: FieldPaletteProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Add field"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/60"
        >
          <Plus className="h-4 w-4" />
          Add field
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 overflow-y-auto" align="start">
        {(Object.keys(PALETTE) as Category[]).map((category) => (
          <div key={category}>
            <div className="px-2.5 pb-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">
              {CATEGORY_LABELS[category]}
            </div>
            {PALETTE[category].map(({ kind, label }) => (
              <DropdownMenuItem key={kind} onClick={() => onAddKind(kind)}>
                {label}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
