'use client';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
} from '@sow-platform/ui';
import type { WorkflowStep } from '@/lib/data/workflow-templates';
import { getUser } from '@/lib/data/users';

function DiagramNode({ step, index }: { step: WorkflowStep; index: number }) {
  return (
    <Card className="w-64">
      <CardContent className="flex flex-col gap-2 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="shrink-0">
            {index + 1}
          </Badge>
          <span className="text-sm font-medium">{step.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {step.approverUserIds.map((id) => {
            const user = getUser(id);
            return (
              <Avatar key={id} className="size-6" title={user?.name}>
                <AvatarFallback className="text-[10px]">
                  {user?.avatarInitials}
                </AvatarFallback>
              </Avatar>
            );
          })}
          {step.approverUserIds.length === 0 && (
            <span className="text-xs text-muted-foreground">
              No participants assigned
            </span>
          )}
          {step.approverUserIds.length > 1 && (
            <Badge variant="secondary" className="text-[10px]">
              {step.approvalLogic === 'ALL' ? 'AND' : 'OR'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <svg
        width="16"
        height="24"
        viewBox="0 0 16 24"
        className="text-muted-foreground"
      >
        <line
          x1="8"
          y1="0"
          x2="8"
          y2="16"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polygon points="8,24 2,14 14,14" fill="currentColor" />
      </svg>
    </div>
  );
}

export function WorkflowFlowDiagram({ steps }: { steps: WorkflowStep[] }) {
  if (steps.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Add steps to see the approval flow diagram.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center pb-1">
        <Badge variant="secondary">Start</Badge>
      </div>
      <Connector />
      {steps.map((step, i) => (
        <div key={step.id}>
          <DiagramNode step={step} index={i} />
          {i < steps.length - 1 && <Connector />}
        </div>
      ))}
      <Connector />
      <div className="flex justify-center pt-1">
        <Badge variant="secondary">Approved</Badge>
      </div>
    </div>
  );
}
