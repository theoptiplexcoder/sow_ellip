'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
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
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Separator,
  cn,
} from '@sow-platform/ui';
import {
  updateWorkflowTemplateSteps,
  type ApprovalLogic,
  type WorkflowStep,
} from '@/lib/data/workflow-templates';
import { getUser, users } from '@/lib/data/users';

interface StepFormValue {
  name: string;
  approverUserIds: string[];
  approvalLogic: ApprovalLogic;
}

function StepFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: StepFormValue;
  onSubmit: (value: StepFormValue) => void;
  title: string;
}) {
  const [name, setName] = useState(initial.name);
  const [approverUserIds, setApproverUserIds] = useState<string[]>(
    initial.approverUserIds,
  );
  const [approvalLogic, setApprovalLogic] = useState<ApprovalLogic>(
    initial.approvalLogic,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (next) {
          setName(initial.name);
          setApproverUserIds(initial.approverUserIds);
          setApprovalLogic(initial.approvalLogic);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Name the step and assign the Participant(s) who approve at this
            step.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            if (!name.trim()) return;
            onSubmit({ name: name.trim(), approverUserIds, approvalLogic });
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="step-name">Step name</Label>
            <Input
              id="step-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Manager Review"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Participants</Label>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border p-2">
              {users.map((u) => {
                const checked = approverUserIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next: boolean) =>
                        setApproverUserIds((prev) =>
                          next
                            ? [...prev, u.id]
                            : prev.filter((id) => id !== u.id),
                        )
                      }
                    />
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[10px]">
                        {u.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    {u.name}
                  </label>
                );
              })}
            </div>
          </div>
          {approverUserIds.length > 1 && (
            <div className="flex flex-col gap-2">
              <Label>Approval logic</Label>
              <RadioGroup
                value={approvalLogic}
                onValueChange={(value: ApprovalLogic) =>
                  setApprovalLogic(value)
                }
              >
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <RadioGroupItem value="ALL" className="mt-0.5" />
                  <span>
                    <span className="font-medium">
                      All participants must approve
                    </span>{' '}
                    (AND)
                    <span className="block text-xs text-muted-foreground">
                      Every participant on this step has to approve before it
                      advances.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <RadioGroupItem value="ANY" className="mt-0.5" />
                  <span>
                    <span className="font-medium">
                      Any one participant can approve
                    </span>{' '}
                    (OR)
                    <span className="block text-xs text-muted-foreground">
                      A single approval from any participant advances this step.
                    </span>
                  </span>
                </label>
              </RadioGroup>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Save Step</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SortableStep({
  step,
  index,
  total,
  onEdit,
  onDelete,
}: {
  step: WorkflowStep;
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
  } = useSortable({ id: step.id });
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
            aria-label="Reorder step"
          >
            <GripVertical className="size-4" />
          </button>
          <Badge variant="outline" className="shrink-0">
            Step {index + 1}
          </Badge>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{step.name}</span>
              {step.approverUserIds.length > 1 && (
                <Badge variant="secondary" className="text-[10px]">
                  {step.approvalLogic === 'ALL'
                    ? 'AND — all must approve'
                    : 'OR — any one approves'}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {step.approverUserIds.map((id) => {
                const user = getUser(id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    <Avatar className="size-4">
                      <AvatarFallback className="text-[9px]">
                        {user?.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    {user?.name}
                  </span>
                );
              })}
              {step.approverUserIds.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No participants assigned
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Edit step"
            onClick={onEdit}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            aria-label="Delete step"
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

export function WorkflowStepList({
  templateId,
  steps: initialSteps,
  onStepsChange,
}: {
  templateId: string;
  steps: WorkflowStep[];
  onStepsChange?: (steps: WorkflowStep[]) => void;
}) {
  const router = useRouter();
  const [steps, setSteps] = useState(initialSteps);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useEffect(() => {
    onStepsChange?.(steps);
  }, [steps]);

  const editingStep = steps.find((s) => s.id === editingId);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSteps((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function addStep(value: StepFormValue) {
    setSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        order: prev.length + 1,
        name: value.name,
        approverUserIds: value.approverUserIds,
        approvalLogic: value.approvalLogic,
      },
    ]);
    toast.success('Step added — click Save Workflow to persist');
  }

  function editStep(id: string, value: StepFormValue) {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              name: value.name,
              approverUserIds: value.approverUserIds,
              approvalLogic: value.approvalLogic,
            }
          : s,
      ),
    );
    toast.success('Step updated — click Save Workflow to persist');
  }

  function deleteStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    toast.success('Step removed — click Save Workflow to persist');
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No steps yet. Add a step to start building this workflow.
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1">
              {steps.map((step, i) => (
                <SortableStep
                  key={step.id}
                  step={step}
                  index={i}
                  total={steps.length}
                  onEdit={() => setEditingId(step.id)}
                  onDelete={() => deleteStep(step.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            updateWorkflowTemplateSteps(templateId, steps);
            toast.success('Workflow saved');
            router.refresh();
          }}
        >
          Save Workflow
        </Button>
      </div>

      <StepFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Step"
        initial={{ name: '', approverUserIds: [], approvalLogic: 'ALL' }}
        onSubmit={addStep}
      />

      {editingStep && (
        <StepFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          title="Edit Step"
          initial={{
            name: editingStep.name,
            approverUserIds: editingStep.approverUserIds,
            approvalLogic: editingStep.approvalLogic,
          }}
          onSubmit={(value) => editStep(editingStep.id, value)}
        />
      )}
    </div>
  );
}
