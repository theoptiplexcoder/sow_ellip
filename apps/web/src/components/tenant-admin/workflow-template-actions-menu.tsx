'use client';

import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sow-platform/ui';
import {
  updateWorkflowTemplateStatus,
  type WorkflowTemplate,
} from '@/lib/data/workflow-templates';

export function WorkflowTemplateActionsMenu({
  id,
  status,
  onChanged,
}: {
  id: string;
  status: WorkflowTemplate['status'];
  onChanged: () => void;
}) {
  function setStatus(next: WorkflowTemplate['status'], message: string) {
    updateWorkflowTemplateStatus(id, next);
    toast.success(message);
    onChanged();
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
