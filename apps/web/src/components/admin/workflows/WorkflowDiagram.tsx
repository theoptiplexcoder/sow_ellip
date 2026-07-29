'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType, type Node, type Edge, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { MatchType } from '@sow/workflows';
import { cn } from '../../../lib/cn';

type Step = { label: string; approverIds: string[]; matchType: MatchType; role: string; approvedBy?: string[] };

type NodeState = 'done' | 'current' | 'pending';

const NODE_STATE_CLASS: Record<NodeState, string> = {
  done: '!border-emerald-400 !bg-emerald-50 !text-emerald-700',
  current: '!border-primary !bg-accent !text-accent-foreground !font-semibold !shadow-[0_0_0_3px_var(--color-accent)]',
  pending: '!border-border !bg-muted !text-muted-foreground',
};

const EDGE_STATE_STROKE: Record<NodeState, string> = {
  done: '#10b981',
  current: 'var(--color-primary)',
  pending: 'var(--color-border)',
};

type StepLabelData = { label: string; role: string };

function StepLabelNode({ data }: NodeProps<Node<StepLabelData>>) {
  return (
    <div className="text-center" style={{ width: 220 }}>
      <div className="text-xs font-medium text-foreground">{data.label}</div>
      <div className="text-[10px] text-muted-foreground">{data.role.charAt(0) + data.role.slice(1).toLowerCase()}</div>
    </div>
  );
}

type ParticipantNodeData = { name: string; approved: boolean; stateClass: string };

function ParticipantNode({ data }: NodeProps<Node<ParticipantNodeData>>) {
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2.5 shadow-sm', data.stateClass)} style={{ width: 170 }}>
      <Handle type="target" position={Position.Top} />
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
          data.approved ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground',
        )}
      >
        {data.name.charAt(0)}
      </span>
      <span className="truncate text-xs font-medium">{data.name}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

type JunctionNodeData = { label: MatchType; stateClass: string };

function JunctionNode({ data }: NodeProps<Node<JunctionNodeData>>) {
  return (
    <div className={cn('flex h-12 w-12 items-center justify-center rounded-full border-2 text-[11px] font-bold shadow-sm', data.stateClass)}>
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function StartNode() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-[11px] font-semibold text-white shadow-md">
      Start
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function EndNode({ data }: NodeProps<Node<{ state: NodeState }>>) {
  return (
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-full border-2 text-[11px] font-semibold shadow-md',
        data.state === 'done' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-red-400 bg-red-50 text-red-500',
      )}
    >
      <Handle type="target" position={Position.Top} />
      {data.state === 'done' ? 'Done' : 'End'}
    </div>
  );
}

const nodeTypes = { stepLabel: StepLabelNode, participant: ParticipantNode, junction: JunctionNode, start: StartNode, end: EndNode };

const START_SIZE = 56;
const BOX_W = 170;
const BOX_H = 64;
const BOX_GAP_X = 36;
const JUNCTION_SIZE = 48;
const LABEL_H = 32;
const CENTER_X = 300;

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
    function stateFor(stageIndex: number): NodeState {
      if (stageIndex < clampedCurrent) return 'done';
      if (stageIndex === clampedCurrent) return 'current';
      return 'pending';
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: CENTER_X - START_SIZE / 2, y: 0 },
      data: {},
      sourcePosition: Position.Bottom,
    });

    let cursorY = START_SIZE + 60;
    let exitId = 'start';

    steps.forEach((step, i) => {
      const state = stateFor(i);
      const stateClass = NODE_STATE_CLASS[state];
      const approvedIds =
        state !== 'done' ? [] : step.matchType === 'AND' ? step.approverIds : (step.approvedBy ?? step.approverIds.slice(0, 1));

      nodes.push({
        id: `step-${i}-label`,
        type: 'stepLabel',
        position: { x: CENTER_X - 110, y: cursorY },
        data: { label: step.label, role: step.role },
        draggable: false,
        selectable: false,
      });
      cursorY += LABEL_H + 8;

      const rowWidth = step.approverIds.length * BOX_W + (step.approverIds.length - 1) * BOX_GAP_X;
      const rowStartX = CENTER_X - rowWidth / 2;

      const participantIds = step.approverIds.map((approverId, j) => {
        const id = `step-${i}-p-${j}`;
        nodes.push({
          id,
          type: 'participant',
          position: { x: rowStartX + j * (BOX_W + BOX_GAP_X), y: cursorY },
          data: {
            name: approverName(approverId),
            approved: approvedIds.includes(approverId),
            stateClass,
          } satisfies ParticipantNodeData,
        });
        edges.push({
          id: `${exitId}-${id}`,
          source: exitId,
          target: id,
          animated: state === 'current',
          type: 'smoothstep',
          style: { stroke: EDGE_STATE_STROKE[state], strokeWidth: state === 'pending' ? 2.5 : 4, strokeLinecap: 'round' },
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STATE_STROKE[state], width: 18, height: 18 },
        });
        return id;
      });
      cursorY += BOX_H + 40;

      if (participantIds.length > 1) {
        const junctionId = `step-${i}-junction`;
        nodes.push({
          id: junctionId,
          type: 'junction',
          position: { x: CENTER_X - JUNCTION_SIZE / 2, y: cursorY },
          data: { label: step.matchType, stateClass } satisfies JunctionNodeData,
        });
        participantIds.forEach((id) => {
          edges.push({
            id: `${id}-${junctionId}`,
            source: id,
            target: junctionId,
            animated: state === 'current',
            type: 'smoothstep',
            style: { stroke: EDGE_STATE_STROKE[state], strokeWidth: state === 'pending' ? 2.5 : 4, strokeLinecap: 'round' },
          });
        });
        cursorY += JUNCTION_SIZE + 40;
        exitId = junctionId;
      } else {
        exitId = participantIds[0];
      }
    });

    const endState = stateFor(steps.length);
    nodes.push({
      id: 'end',
      type: 'end',
      position: { x: CENTER_X - START_SIZE / 2, y: cursorY },
      data: { state: endState },
      targetPosition: Position.Top,
    });
    edges.push({
      id: `${exitId}-end`,
      source: exitId,
      target: 'end',
      animated: endState === 'current',
      type: 'smoothstep',
      style: { stroke: EDGE_STATE_STROKE[endState], strokeWidth: endState === 'pending' ? 2.5 : 4, strokeLinecap: 'round' },
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STATE_STROKE[endState], width: 18, height: 18 },
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
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Did not act
          </span>
        </div>
      </div>
      <div className="h-105 w-full rounded-lg border border-border bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
