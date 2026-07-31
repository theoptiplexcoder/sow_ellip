'use client';

import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import {
  APPROVERS,
  STEP_ROLES,
  emptyStep,
  type MatchType,
  type Step,
  type StepRole,
} from '@sow/workflows';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../../ui/select';
import { StepApproversEditor } from '../workflows/StepApproversEditor';

type TemplateWorkflowPanelProps = {
  steps: Step[];
  onChange: (steps: Step[]) => void;
};

/** Default approval workflow for SOWs created from this template — same step model as /admin/workflows. */
export function TemplateWorkflowPanel({ steps, onChange }: TemplateWorkflowPanelProps) {
  function addStep() {
    onChange([...steps, emptyStep()]);
  }

  function removeStep(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function updateStep(index: number, patch: Partial<Step>) {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  return (
    <div className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border p-4">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Approval workflow</Label>
        <Button type="button" size="sm" variant="ghost" onClick={addStep}>
          <Plus className="h-3.5 w-3.5" />
          Add step
        </Button>
      </div>

      {steps.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No steps yet. SOWs created from this template will need a workflow assigned manually.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-md border border-border p-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs font-medium text-muted-foreground">{index + 1}</span>
              <Input
                placeholder="Step label"
                value={step.label}
                onChange={(e) => updateStep(index, { label: e.target.value })}
                className="flex-1"
              />
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveStep(index, -1)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                  aria-label="Move step up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === steps.length - 1}
                  onClick={() => moveStep(index, 1)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                  aria-label="Move step down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                  aria-label="Remove step"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <StepApproversEditor
              approverIds={step.approverIds}
              approvers={APPROVERS}
              matchType={step.matchType}
              onChange={(patch) => updateStep(index, patch)}
              className="w-full"
            />

            <div className="flex items-center gap-2">
              <Select
                value={step.matchType}
                onValueChange={(v) => updateStep(index, { matchType: v as MatchType })}
              >
                <SelectTrigger className="flex-1" />
                <SelectContent>
                  {step.approverIds.length <= 1 ? (
                    <SelectItem value="NA">NA</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Select value={step.role} onValueChange={(v) => updateStep(index, { role: v as StepRole })}>
                <SelectTrigger className="flex-1" />
                <SelectContent>
                  {STEP_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
