'use client';

import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sow-platform/ui';
import { updateWorkflowTemplateStatus } from '@/lib/actions/workflow-templates';
import type { WorkflowTemplate } from '@/lib/data/workflow-templates';

export function WorkflowTemplateActionsMenu({
  id,
  status,
}: {
  id: string;
  status: WorkflowTemplate['status'];
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function setStatus(next: WorkflowTemplate['status'], message: string) {
    setIsPending(true);
    try {
      await updateWorkflowTemplateStatus(id, next);
      toast.success(message);
      router.refresh();
    } catch {
      toast.error('Failed to update workflow template');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Workflow actions"
            disabled={isPending}
          />
        }
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status !== 'active' && (
          <DropdownMenuItem
            onClick={() =>
              setStatus('active', 'Workflow activated — visible to creators')
            }
          >
            Activate
          </DropdownMenuItem>
        )}
        {status === 'active' && (
          <DropdownMenuItem
            onClick={() =>
              setStatus(
                'inactive',
                'Workflow deactivated — hidden from creators',
              )
            }
          >
            Deactivate
          </DropdownMenuItem>
        )}
        {status !== 'archived' && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setStatus('archived', 'Workflow archived')}
          >
            Archive
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
