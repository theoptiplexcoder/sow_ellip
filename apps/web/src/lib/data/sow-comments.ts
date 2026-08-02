// Shared comment thread on a SOW (PRD §5.6a). Additive and non-blocking —
// never participates in the SOW state machine or approval actions.

export interface SowComment {
  id: string;
  sowId: string;
  authorId: string;
  authorName: string;
  authorType: 'participant' | 'client';
  body: string;
  createdAt: string;
}

export const sowComments: SowComment[] = [
  {
    id: 'cmt-1',
    sowId: 'sow-1042',
    authorId: 'c1-1',
    authorName: 'Wendy Fischer',
    authorType: 'client',
    body: 'Can we confirm the pilot store count includes the downtown location?',
    createdAt: '2026-07-31 09:12',
  },
  {
    id: 'cmt-2',
    sowId: 'sow-1042',
    authorId: 'user-6',
    authorName: 'Ravi Kapoor',
    authorType: 'participant',
    body: 'Yes, downtown is one of the 12 pilot stores in scope.',
    createdAt: '2026-07-31 11:04',
  },
  {
    id: 'cmt-3',
    sowId: 'sow-1039',
    authorId: 'user-1',
    authorName: 'Dana Whitfield',
    authorType: 'participant',
    body: 'Legal flagged the DPA — see audit log for the change request.',
    createdAt: '2026-07-28 10:20',
  },
];

export function getCommentsForSow(sowId: string) {
  return sowComments
    .filter((c) => c.sowId === sowId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addSowComment(
  sowId: string,
  input: {
    authorId: string;
    authorName: string;
    authorType: 'participant' | 'client';
    body: string;
  },
) {
  const comment: SowComment = {
    id: `cmt-${Date.now()}`,
    sowId,
    ...input,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
  sowComments.push(comment);
  return comment;
}
