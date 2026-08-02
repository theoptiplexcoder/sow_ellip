'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@sow-platform/ui';
import {
  workflowTemplates,
  type WorkflowTemplate,
} from '@/lib/data/workflow-templates';
import { createWorkflowTemplate } from '@/lib/actions/workflow-templates';

export function NewWorkflowTemplateDialog({
  onCreated,
}: {
  onCreated: (template: WorkflowTemplate) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New Workflow Template
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Workflow Template</DialogTitle>
          <DialogDescription>
            Creates an empty workflow. Open it afterwards to add ordered
            approval steps in the Workflow Builder.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = new FormData(form).get('name') as string;
            if (!name?.trim()) return;
            const template = await createWorkflowTemplate(name.trim());
            workflowTemplates.push(template);
            onCreated(template);
            toast.success('Workflow template created');
            setOpen(false);
            form.reset();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="wf-name">Workflow name</Label>
            <Input
              id="wf-name"
              name="name"
              placeholder="Standard Workflow"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Create Workflow</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
