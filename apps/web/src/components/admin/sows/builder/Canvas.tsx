'use client';

import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { DRAG_KIND_MIME } from './FieldPalette';
import {
  CONTAINER_KINDS,
  FIELD_KIND_LABELS,
  METADATA_KINDS,
  collectKeys,
  newField,
  type FieldDraft,
  type FieldKind,
} from './types';
import {
  duplicateNodeAtPath,
  getNodeAtPath,
  insertNodeAtParentPath,
  moveNodeWithinParent,
  pathsEqual,
  removeNodeAtPath,
} from './treeOps';

const MOVE_MIME = 'text/x-sow-move-path';

export function Canvas({
  fields,
  onFieldsChange,
  selectedPath,
  onSelect,
}: {
  fields: FieldDraft[];
  onFieldsChange: (fields: FieldDraft[]) => void;
  selectedPath: number[] | null;
  onSelect: (path: number[] | null) => void;
}) {
  function handleDropAt(parentPath: number[], index: number, e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const kind = e.dataTransfer.getData(DRAG_KIND_MIME) as FieldKind | '';
    const movePathRaw = e.dataTransfer.getData(MOVE_MIME);

    if (kind) {
      const node = newField(collectKeys(fields), kind);
      onFieldsChange(insertNodeAtParentPath(fields, parentPath, index, node));
      return;
    }
    if (!movePathRaw) return;
    const movePath: number[] = JSON.parse(movePathRaw);
    const moveParent = movePath.slice(0, -1);
    if (pathsEqual(moveParent, parentPath)) {
      onFieldsChange(moveNodeWithinParent(fields, parentPath, movePath[movePath.length - 1], index));
      return;
    }
    const node = getNodeAtPath(fields, movePath);
    if (!node) return;
    const removed = removeNodeAtPath(fields, movePath);
    onFieldsChange(insertNodeAtParentPath(removed, parentPath, index, node));
  }

  if (fields.length === 0) {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDropAt([], 0, e)}
        className="rounded-md border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground"
      >
        Drag a field from the palette here, or click a field type to add it.
      </div>
    );
  }

  return (
    <div className="space-y-2" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropAt([], fields.length, e)}>
      {fields.map((field, i) => (
        <FieldRow
          key={i}
          field={field}
          path={[i]}
          fields={fields}
          onFieldsChange={onFieldsChange}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onDropAt={handleDropAt}
        />
      ))}
    </div>
  );
}

function FieldRow({
  field,
  path,
  fields,
  onFieldsChange,
  selectedPath,
  onSelect,
  onDropAt,
}: {
  field: FieldDraft;
  path: number[];
  fields: FieldDraft[];
  onFieldsChange: (fields: FieldDraft[]) => void;
  selectedPath: number[] | null;
  onSelect: (path: number[] | null) => void;
  onDropAt: (parentPath: number[], index: number, e: React.DragEvent) => void;
}) {
  const isContainer = CONTAINER_KINDS.includes(field.kind);
  const isMetadata = METADATA_KINDS.includes(field.kind);
  const isSelected = pathsEqual(selectedPath, path);
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];

  function remove(e: React.MouseEvent) {
    e.stopPropagation();
    onFieldsChange(removeNodeAtPath(fields, path));
    if (isSelected) onSelect(null);
  }

  function duplicate(e: React.MouseEvent) {
    e.stopPropagation();
    onFieldsChange(duplicateNodeAtPath(fields, path, collectKeys(fields)));
  }

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData(MOVE_MIME, JSON.stringify(path))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDropAt(parentPath, index + 1, e)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(path);
      }}
      className={cn(
        'rounded-md border bg-card p-3 transition-colors',
        isSelected ? 'border-primary ring-1 ring-primary/40' : 'border-border hover:border-primary/30',
      )}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">{field.title || field.key}</span>
            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
              {FIELD_KIND_LABELS[field.kind]}
            </span>
            {field.required && <span className="shrink-0 text-xs text-red-600">*</span>}
          </div>
          {!isMetadata && <p className="truncate text-xs text-muted-foreground">{field.key}</p>}
        </div>
        <button type="button" aria-label="Duplicate field" className="rounded p-1.5 text-muted-foreground hover:bg-accent" onClick={duplicate}>
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Remove field"
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-red-600"
          onClick={remove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {isContainer && (
        <div
          className="ml-6 mt-3 space-y-2 border-l-2 border-border pl-4"
          onClick={(e) => e.stopPropagation()}
          onDragOver={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onDrop={(e) => onDropAt(path, field.children?.length ?? 0, e)}
        >
          {(field.children ?? []).length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              Drop fields here to nest them inside &quot;{field.title || field.key}&quot;.
            </p>
          ) : (
            (field.children ?? []).map((child, i) => (
              <FieldRow
                key={i}
                field={child}
                path={[...path, i]}
                fields={fields}
                onFieldsChange={onFieldsChange}
                selectedPath={selectedPath}
                onSelect={onSelect}
                onDropAt={onDropAt}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
