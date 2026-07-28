'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, Position, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type Step = { label: string; approverId: string; role: string };

type NodeState = 'done' | 'current' | 'pending';

const NODE_STATE_CLASS: Record<NodeState, string> = {
  done: '!border-emerald-400 !bg-emerald-50 !text-emerald-700',
  current: '!border-primary !bg-accent !text-accent-foreground !font-semibold !shadow-[0_0_0_3px_var(--color-accent)]',
  pending: '!border-border !bg-muted !text-muted-foreground',
};

export function WorkflowDiagram({
  steps,
  approverName,
  currentStep,
}: {
  steps: Step[];
  approverName: (id: string) => string;
  currentStep: number;
}) {
  const totalStages = steps.length + 1; // steps + final approval
  const clampedCurrent = Math.min(currentStep, totalStages);

  const { nodes, edges } = useMemo(() => {
    const nodeWidth = 200;
    const gapY = 110;

    function stateFor(stageIndex: number): NodeState {
      if (stageIndex < clampedCurrent) return 'done';
      if (stageIndex === clampedCurrent) return 'current';
      return 'pending';
    }

    const stepNodes: Node[] = steps.map((step, i) => ({
      id: `step-${i}`,
      position: { x: 0, y: (i + 1) * gapY },
      data: { label: `${step.label}\n${approverName(step.approverId)} · ${step.role.charAt(0) + step.role.slice(1).toLowerCase()}` },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      className: NODE_STATE_CLASS[stateFor(i)],
      style: {
        width: nodeWidth,
        whiteSpace: 'pre-line',
        textAlign: 'center' as const,
        fontSize: 12,
      },
    }));

    const nodes: Node[] = [
      {
        id: 'start',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
        sourcePosition: Position.Bottom,
        className: NODE_STATE_CLASS.done,
        style: { width: nodeWidth },
      },
      ...stepNodes,
      {
        id: 'end',
        type: 'output',
        position: { x: 0, y: (steps.length + 1) * gapY },
        data: { label: 'Approved' },
        targetPosition: Position.Top,
        className: NODE_STATE_CLASS[stateFor(steps.length)],
        style: { width: nodeWidth },
      },
    ];

    const ids = ['start', ...stepNodes.map((n) => n.id), 'end'];
    const edges: Edge[] = ids.slice(0, -1).map((id, i) => {
      const targetStageIndex = i; // edge leads into stage `i` (0 = first step, steps.length = end)
      const isTraversed = targetStageIndex <= clampedCurrent;
      return {
        id: `${id}-${ids[i + 1]}`,
        source: id,
        target: ids[i + 1],
        animated: isTraversed && targetStageIndex === clampedCurrent,
        type: 'smoothstep',
        style: {
          stroke: isTraversed ? 'var(--color-primary)' : 'var(--color-border)',
          strokeWidth: isTraversed ? 2 : 1.5,
        },
      };
    });

    return { nodes, edges };
  }, [steps, approverName, clampedCurrent]);

  const progressLabel =
    clampedCurrent >= totalStages
      ? 'Fully approved'
      : `Step ${clampedCurrent + 1} of ${totalStages} — in progress`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{progressLabel}</span>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Done
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" /> Current
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Pending
          </span>
        </div>
      </div>
      <div className="h-105 w-full rounded-lg border border-border bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
