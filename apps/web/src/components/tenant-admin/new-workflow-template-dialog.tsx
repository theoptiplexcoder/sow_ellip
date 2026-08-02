'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { createWorkflowTemplate } from '@/lib/actions/workflow-templates';

export function NewWorkflowTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
            const name = new FormData(e.currentTarget).get('name') as string;
            setIsSubmitting(true);
            try {
              await createWorkflowTemplate(name);
              toast.success('Workflow template created');
              setOpen(false);
              router.refresh();
            } catch {
              toast.error('Failed to create workflow template');
            } finally {
              setIsSubmitting(false);
            }
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
