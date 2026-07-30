'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { cn } from '../../../../lib/cn';
import {
  CONDITION_OPERATOR_LABELS,
  emptyConditionGroup,
  nextId,
  type Condition,
  type ConditionGroup,
  type ConditionOperator,
  type ConditionalAction,
  type ConditionalActionKind,
  type ConditionalRule,
} from './types';

type FieldRef = { key: string; title: string };

const ACTION_LABELS: Record<ConditionalActionKind, string> = {
  show: 'Show',
  hide: 'Hide',
  require: 'Require',
  disable: 'Disable',
  enable: 'Enable',
};

function ConditionRow({
  condition,
  fieldRefs,
  onChange,
  onRemove,
}: {
  condition: Condition;
  fieldRefs: FieldRef[];
  onChange: (next: Condition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        aria-label="Condition field"
        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
      >
        <option value="">Field...</option>
        {fieldRefs.map((f) => (
          <option key={f.key} value={f.key}>
            {f.title}
          </option>
        ))}
      </select>
      <select
        aria-label="Condition operator"
        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as ConditionOperator })}
      >
        {Object.entries(CONDITION_OPERATOR_LABELS).map(([op, label]) => (
          <option key={op} value={op}>
            {label}
          </option>
        ))}
      </select>
      {condition.operator !== 'isEmpty' && condition.operator !== 'isNotEmpty' && (
        <Input
          className="h-7 w-28 px-2 py-1 text-xs"
          value={condition.value ?? ''}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="value"
        />
      )}
      <button type="button" aria-label="Remove condition" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ConditionGroupEditor({
  group,
  fieldRefs,
  onChange,
  depth = 0,
}: {
  group: ConditionGroup;
  fieldRefs: FieldRef[];
  onChange: (next: ConditionGroup) => void;
  depth?: number;
}) {
  function updateChild(index: number, next: Condition | ConditionGroup) {
    const children = group.children.map((c, i) => (i === index ? next : c));
    onChange({ ...group, children });
  }

  function removeChild(index: number) {
    onChange({ ...group, children: group.children.filter((_, i) => i !== index) });
  }

  function addCondition() {
    onChange({ ...group, children: [...group.children, { type: 'condition', field: '', operator: 'equals', value: '' }] });
  }

  function addGroup() {
    onChange({ ...group, children: [...group.children, emptyConditionGroup()] });
  }

  return (
    <div className={cn('space-y-2 rounded-md border border-border p-2', depth > 0 && 'bg-muted/30')}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Match</span>
        <div className="inline-flex overflow-hidden rounded-md border border-border text-xs">
          {(['AND', 'OR'] as const).map((logic) => (
            <button
              key={logic}
              type="button"
              className={cn('px-2 py-1 font-medium', group.logic === logic ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent')}
              onClick={() => onChange({ ...group, logic })}
            >
              {logic}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">of the following:</span>
      </div>

      <div className="space-y-2 pl-2">
        {group.children.map((child, i) =>
          child.type === 'condition' ? (
            <ConditionRow key={i} condition={child} fieldRefs={fieldRefs} onChange={(next) => updateChild(i, next)} onRemove={() => removeChild(i)} />
          ) : (
            <div key={i} className="flex items-start gap-2">
              <ConditionGroupEditor group={child} fieldRefs={fieldRefs} onChange={(next) => updateChild(i, next)} depth={depth + 1} />
              <button type="button" aria-label="Remove group" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600" onClick={() => removeChild(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ),
        )}
      </div>

      <div className="flex gap-2 pl-2">
        <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={addCondition}>
          + Condition
        </button>
        <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={addGroup}>
          + Nested group
        </button>
      </div>
    </div>
  );
}

function ActionRow({
  action,
  fieldRefs,
  onChange,
  onRemove,
}: {
  action: ConditionalAction;
  fieldRefs: FieldRef[];
  onChange: (next: ConditionalAction) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        aria-label="Action"
        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
        value={action.action}
        onChange={(e) => onChange({ ...action, action: e.target.value as ConditionalActionKind })}
      >
        {Object.entries(ACTION_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <select
        aria-label="Action target field"
        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
        value={action.target}
        onChange={(e) => onChange({ ...action, target: e.target.value })}
      >
        <option value="">Target field...</option>
        {fieldRefs.map((f) => (
          <option key={f.key} value={f.key}>
            {f.title}
          </option>
        ))}
      </select>
      <button type="button" aria-label="Remove action" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ConditionalLogicEditor({
  rules,
  fieldRefs,
  onChange,
}: {
  rules: ConditionalRule[];
  fieldRefs: FieldRef[];
  onChange: (next: ConditionalRule[]) => void;
}) {
  function updateRule(index: number, patch: Partial<ConditionalRule>) {
    onChange(rules.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRule(index: number) {
    onChange(rules.filter((_, i) => i !== index));
  }

  function addRule() {
    onChange([...rules, { id: nextId('rule'), when: emptyConditionGroup(), actions: [] }]);
  }

  return (
    <div className="space-y-3">
      {rules.map((rule, i) => (
        <div key={rule.id} className="space-y-2 rounded-md border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rule {i + 1}</span>
            <button type="button" aria-label="Remove rule" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600" onClick={() => removeRule(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-xs font-medium text-muted-foreground">IF</p>
          <ConditionGroupEditor group={rule.when} fieldRefs={fieldRefs} onChange={(when) => updateRule(i, { when })} />

          <p className="text-xs font-medium text-muted-foreground">THEN</p>
          <div className="space-y-1.5 pl-2">
            {rule.actions.map((action, ai) => (
              <ActionRow
                key={ai}
                action={action}
                fieldRefs={fieldRefs}
                onChange={(next) => updateRule(i, { actions: rule.actions.map((a, j) => (j === ai ? next : a)) })}
                onRemove={() => updateRule(i, { actions: rule.actions.filter((_, j) => j !== ai) })}
              />
            ))}
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => updateRule(i, { actions: [...rule.actions, { action: 'show', target: '' }] })}
            >
              + Action
            </button>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={addRule}>
        <Plus className="h-3.5 w-3.5" />
        Add rule
      </Button>
    </div>
  );
}
