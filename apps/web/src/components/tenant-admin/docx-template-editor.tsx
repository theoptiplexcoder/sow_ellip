'use client';

import { useRef, useState } from 'react';
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
import {
  Bold,
  GripVertical,
  Italic,
  List,
  ListOrdered,
  Plus,
  Trash2,
  Underline,
} from 'lucide-react';
import { Badge, Button, Input, Separator, cn } from '@sow-platform/ui';

interface DocxSection {
  id: string;
  placeholder: string;
  content: string;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
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

function EditableBlock({
  section,
  onPlaceholderChange,
  onContentChange,
  onDelete,
}: {
  section: DocxSection;
  onPlaceholderChange: (value: string) => void;
  onContentChange: (html: string) => void;
  onDelete: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-md px-2 py-2 hover:bg-muted/40',
        isDragging && 'z-10 bg-background opacity-70 shadow-lg',
      )}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground opacity-0 group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Reorder section"
        >
          <GripVertical className="size-3.5" />
        </button>
        <Input
          value={section.placeholder}
          onChange={(e) => onPlaceholderChange(e.target.value)}
          className="h-6 max-w-56 border-none bg-transparent px-1 font-mono text-[11px] text-muted-foreground shadow-none focus-visible:ring-1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-6 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
          aria-label="Delete section"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-8 rounded-sm px-1 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-ring"
        onBlur={() => onContentChange(contentRef.current?.innerHTML ?? '')}
        onInput={() => onContentChange(contentRef.current?.innerHTML ?? '')}
        dangerouslySetInnerHTML={{ __html: section.content }}
      />
    </div>
  );
}

export function DocxTemplateEditor({
  sections: initialSections,
}: {
  sections: DocxSection[];
}) {
  const [sections, setSections] = useState(initialSections);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function format(command: string) {
    document.execCommand(command);
  }

  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        placeholder: '{{new_placeholder}}',
        content: '',
      },
    ]);
  }

  function updatePlaceholder(id: string, value: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, placeholder: value } : s)),
    );
  }

  function updateContent(id: string, html: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: html } : s)),
    );
  }

  function deleteSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-1.5">
        <ToolbarButton
          icon={Bold}
          label="Bold"
          onClick={() => format('bold')}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          onClick={() => format('italic')}
        />
        <ToolbarButton
          icon={Underline}
          label="Underline"
          onClick={() => format('underline')}
        />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <ToolbarButton
          icon={List}
          label="Bullet list"
          onClick={() => format('insertUnorderedList')}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Numbered list"
          onClick={() => format('insertOrderedList')}
        />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          type="button"
          onClick={addSection}
        >
          <Plus className="size-3.5" />
          Insert Section
        </Button>
        <span className="ml-auto hidden text-[10px] text-muted-foreground sm:inline">
          Click into the document below to edit
        </span>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <div className="mx-auto max-w-3xl p-8">
          {sections.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No content yet. Insert a section to start editing this document.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col divide-y">
                  {sections.map((section) => (
                    <EditableBlock
                      key={section.id}
                      section={section}
                      onPlaceholderChange={(value) =>
                        updatePlaceholder(section.id, value)
                      }
                      onContentChange={(html) =>
                        updateContent(section.id, html)
                      }
                      onDelete={() => deleteSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <Badge key={s.id} variant="outline" className="font-mono text-[10px]">
            {s.placeholder}
          </Badge>
        ))}
      </div>

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
    </div>
  );
}
