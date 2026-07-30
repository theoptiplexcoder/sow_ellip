import type { Condition, ConditionGroup, ConditionalActionKind } from './types';

function readValue(data: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
    return undefined;
  }, data);
}

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

export function evaluateCondition(condition: Condition, data: Record<string, unknown>): boolean {
  const raw = readValue(data, condition.field);
  switch (condition.operator) {
    case 'equals':
      return String(raw ?? '') === (condition.value ?? '');
    case 'notEquals':
      return String(raw ?? '') !== (condition.value ?? '');
    case 'contains':
      return Array.isArray(raw)
        ? raw.map(String).includes(condition.value ?? '')
        : String(raw ?? '').includes(condition.value ?? '');
    case 'greaterThan':
      return Number(raw) > Number(condition.value);
    case 'lessThan':
      return Number(raw) < Number(condition.value);
    case 'isEmpty':
      return isEmptyValue(raw);
    case 'isNotEmpty':
      return !isEmptyValue(raw);
    default:
      return false;
  }
}

export function evaluateConditionGroup(group: ConditionGroup, data: Record<string, unknown>): boolean {
  if (!group.children.length) return true;
  const results = group.children.map((child) =>
    child.type === 'condition' ? evaluateCondition(child, data) : evaluateConditionGroup(child, data),
  );
  return group.logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

export type TargetRule = { when: ConditionGroup; action: ConditionalActionKind };

export type FieldEffects = { hidden?: boolean; required?: boolean; disabled?: boolean };

export function computeFieldEffects(rules: TargetRule[], data: Record<string, unknown>): FieldEffects {
  const effects: FieldEffects = {};
  for (const rule of rules) {
    const matched = evaluateConditionGroup(rule.when, data);
    switch (rule.action) {
      case 'show':
        effects.hidden = !matched;
        break;
      case 'hide':
        effects.hidden = matched;
        break;
      case 'require':
        effects.required = matched;
        break;
      case 'disable':
        effects.disabled = matched;
        break;
      case 'enable':
        effects.disabled = !matched;
        break;
    }
  }
  return effects;
}
