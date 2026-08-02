'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  cn,
} from '@sow-platform/ui';
import type { TemplateField, TemplateFieldType } from '@/lib/data/templates';

const fieldTypeLabels: Record<TemplateFieldType, string> = {
  text: 'Text',
  textarea: 'Text area',
  date: 'Date',
  number: 'Number',
  table: 'Table',
};

const fieldTypes = Object.keys(fieldTypeLabels) as TemplateFieldType[];

interface FieldFormValue {
  label: string;
  type: TemplateFieldType;
  defaultValue: string;
}

function FieldFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: FieldFormValue;
  onSubmit: (value: FieldFormValue) => void;
  title: string;
}) {
  const [label, setLabel] = useState(initial.label);
  const [type, setType] = useState<TemplateFieldType>(initial.type);
  const [defaultValue, setDefaultValue] = useState(initial.defaultValue);

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (next) {
          setLabel(initial.label);
          setType(initial.type);
          setDefaultValue(initial.defaultValue);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Define the field's label, input type, and an optional default value.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            if (!label.trim()) return;
            onSubmit({ label: label.trim(), type, defaultValue });
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="field-label">Field label</Label>
            <Input
              id="field-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Objectives"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="field-type">Field type</Label>
            <Select
              value={type}
              onValueChange={(v: unknown) => setType(v as TemplateFieldType)}
            >
              <SelectTrigger id="field-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {fieldTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="field-default">Default value (optional)</Label>
            <Input
              id="field-default"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Leave blank for no default"
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Save Field</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SortableField({
  field,
  index,
  total,
  onEdit,
  onDelete,
}: {
  field: TemplateField;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'z-10 opacity-70')}
    >
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <button
            {...attributes}
            {...listeners}
            className="-m-2 cursor-grab touch-none p-2 text-muted-foreground active:cursor-grabbing"
            aria-label="Reorder field"
          >
            <GripVertical className="size-4" />
          </button>
          <Badge variant="outline" className="shrink-0">
            {index + 1}
          </Badge>
          <div className="flex-1">
            <div className="text-sm font-medium">{field.label}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-[10px]">
                {fieldTypeLabels[field.type]}
              </Badge>
              {field.defaultValue && <span>Default: {field.defaultValue}</span>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Edit field"
            onClick={onEdit}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            aria-label="Delete field"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </CardContent>
      </Card>
      {index < total - 1 && <Separator className="my-2" />}
    </div>
  );
}

export function TemplateFieldBuilder({
  fields: initialFields,
}: {
  fields: TemplateField[];
}) {
  const [fields, setFields] = useState(initialFields);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const editingField = fields.find((f) => f.id === editingId);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function addField(value: FieldFormValue) {
    setFields((prev) => [
      ...prev,
      {
        id: `field-${Date.now()}`,
        label: value.label,
        type: value.type,
        defaultValue: value.defaultValue || undefined,
      },
    ]);
    toast.success('Field added (prototype only — not persisted)');
  }

  function editField(id: string, value: FieldFormValue) {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              label: value.label,
              type: value.type,
              defaultValue: value.defaultValue || undefined,
            }
          : f,
      ),
    );
    toast.success('Field updated (prototype only — not persisted)');
  }

  function deleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    toast.success('Field removed (prototype only — not persisted)');
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Drag fields to reorder. Default values pre-fill new SOW drafts.
        </p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No fields yet. Add a field to start building this template's schema.
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1">
              {fields.map((field, i) => (
                <SortableField
                  key={field.id}
                  field={field}
                  index={i}
                  total={fields.length}
                  onEdit={() => setEditingId(field.id)}
                  onDelete={() => deleteField(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          onClick={() =>
            toast.success('Template saved (prototype only — not persisted)')
          }
        >
          Save Template
        </Button>
      </div>

      <FieldFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Field"
        initial={{ label: '', type: 'text', defaultValue: '' }}
        onSubmit={addField}
      />

      {editingField && (
        <FieldFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          title="Edit Field"
          initial={{
            label: editingField.label,
            type: editingField.type,
            defaultValue: editingField.defaultValue ?? '',
          }}
          onSubmit={(value) => editField(editingField.id, value)}
        />
      )}
    </div>
  );
}
