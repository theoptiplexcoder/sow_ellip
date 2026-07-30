export type SowFieldChange = {
  fieldLabel: string;
  /** null means the field was empty/unset before this version */
  oldValue: string | null;
  /** null means the field was cleared in this version */
  newValue: string | null;
};

export type SowVersionEntry = {
  version: number;
  updatedAt: string;
  updatedBy: string;
  /** Empty on the version a SOW was first created */
  changes: SowFieldChange[];
};

export const VERSION_HISTORY_BY_SOW: Record<string, SowVersionEntry[]> = {
  's-1': [
    {
      version: 2,
      updatedAt: '2026-07-20',
      updatedBy: 'Ava Patel',
      changes: [
        {
          fieldLabel: 'Budget (USD)',
          oldValue: '48,000',
          newValue: '62,500',
        },
        {
          fieldLabel: 'Overview',
          oldValue: 'This SOW outlines a redesign of the marketing site.',
          newValue: 'This SOW outlines a redesign and rebuild of the marketing site, including a phased content migration from the legacy CMS.',
        },
        {
          fieldLabel: 'Project Description',
          oldValue: null,
          newValue: 'Redesign and rebuild of the client-facing marketing site, including a new component library, CMS integration, and a phased content migration from the legacy platform.',
        },
      ],
    },
    {
      version: 1,
      updatedAt: '2026-07-12',
      updatedBy: 'Ava Patel',
      changes: [],
    },
  ],
  's-2': [
    {
      version: 1,
      updatedAt: '2026-07-25',
      updatedBy: 'Marcus Lee',
      changes: [],
    },
  ],
  's-3': [
    {
      version: 1,
      updatedAt: '2026-07-27',
      updatedBy: 'Marcus Lee',
      changes: [],
    },
  ],
  's-4': [
    {
      version: 1,
      updatedAt: '2026-07-18',
      updatedBy: 'Ava Patel',
      changes: [],
    },
  ],
  's-5': [
    {
      version: 1,
      updatedAt: '2026-07-29',
      updatedBy: 'Priya Shah',
      changes: [],
    },
  ],
  's-6': [
    {
      version: 1,
      updatedAt: '2026-07-30',
      updatedBy: 'Priya Shah',
      changes: [],
    },
  ],
};

export function getVersionHistory(sowId: string): SowVersionEntry[] {
  return VERSION_HISTORY_BY_SOW[sowId] ?? [];
}
