export type StepRole = 'APPROVER' | 'VIEWER';

export type MatchType = 'AND' | 'OR';

export type Step = {
  label: string;
  approverIds: string[];
  matchType: MatchType;
  role: StepRole;
  /** Which approverIds actually approved once this step is done. Only meaningful for OR steps
   * (AND requires everyone, so all approverIds count as approved). Defaults to approverIds[0]. */
  approvedBy?: string[];
};

export const STEP_ROLES: StepRole[] = ['APPROVER', 'VIEWER'];

export type Approver = { id: string; name: string };

export const APPROVERS: Approver[] = [
  { id: 'u-3', name: 'Dana Wu' },
  { id: 'u-4', name: 'Jordan Lee' },
];

export function approverName(id: string): string {
  return APPROVERS.find((a) => a.id === id)?.name ?? 'Unknown';
}

export function approverGroupLabel(step: Pick<Step, 'approverIds' | 'matchType'>): string {
  const names = step.approverIds.map(approverName);
  if (names.length === 0) return 'No approver';
  if (names.length === 1) return names[0];
  return names.join(step.matchType === 'AND' ? ' AND ' : ' OR ');
}

export function emptyStep(): Step {
  return { label: '', approverIds: [APPROVERS[0].id], matchType: 'AND', role: STEP_ROLES[0] };
}
