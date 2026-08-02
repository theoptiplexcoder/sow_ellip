'use client';

import { useState } from 'react';
import type { WorkflowStep } from '@/lib/data/workflow-templates';
import { WorkflowStepList } from '@/components/tenant-admin/workflow-step-list';
import { WorkflowFlowDiagram } from '@/components/tenant-admin/workflow-flow-diagram';

export function WorkflowBuilder({
  steps: initialSteps,
}: {
  steps: WorkflowStep[];
}) {
  const [steps, setSteps] = useState(initialSteps);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <WorkflowStepList steps={initialSteps} onStepsChange={setSteps} />
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <WorkflowFlowDiagram steps={steps} />
      </div>
    </div>
  );
}
