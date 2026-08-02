import type { Sow } from '@/lib/data/sows';

function daysBetween(from: string, to: string) {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

/** Average days from submission to final decision, across a set of decided SOWs. */
export function averageReviewDays(list: Sow[]) {
  const durations = list.flatMap((s) =>
    s.revisions
      .filter(
        (r) =>
          r.submittedAt && (r.status === 'approved' || r.status === 'rejected'),
      )
      .map((r) => {
        const decidedAt = r.workflowInstanceSteps
          .map((step) => step.decidedAt)
          .filter((d): d is string => !!d)
          .sort()
          .at(-1);
        return decidedAt
          ? daysBetween(r.submittedAt as string, decidedAt)
          : null;
      })
      .filter((d): d is number => d !== null),
  );
  if (durations.length === 0) return null;
  return durations.reduce((sum, d) => sum + d, 0) / durations.length;
}
