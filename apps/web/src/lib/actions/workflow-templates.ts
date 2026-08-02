'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import type { WorkflowTemplate } from '@/lib/data/workflow-templates';

const DATA_FILE = path.join(
  process.cwd(),
  'src/lib/data/workflow-templates.ts',
);

const FILE_HEADER = `export type ApprovalLogic = 'ALL' | 'ANY';

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  approverUserIds: string[];
  /** How multiple participants on this step resolve approval: ALL = AND (every participant must approve), ANY = OR (one approval suffices). */
  approvalLogic: ApprovalLogic;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  updatedAt: string;
  steps: WorkflowStep[];
}
`;

const FILE_FOOTER = `
export function getWorkflowTemplate(id: string) {
  return workflowTemplates.find((w) => w.id === id);
}
`;

async function readTemplates(): Promise<WorkflowTemplate[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const match = raw.match(
    /export const workflowTemplates: WorkflowTemplate\[\] = (\[[\s\S]*?\n\]);/,
  );
  if (!match) {
    throw new Error(
      'Could not locate workflowTemplates array in workflow-templates.ts',
    );
  }
  return new Function(`"use strict"; return (${match[1]});`)();
}

async function writeTemplates(templates: WorkflowTemplate[]) {
  const content = `${FILE_HEADER}\nexport const workflowTemplates: WorkflowTemplate[] = ${JSON.stringify(
    templates,
    null,
    2,
  )};\n${FILE_FOOTER}`;
  await fs.writeFile(DATA_FILE, content, 'utf-8');
  revalidatePath('/tenant-admin/workflow-templates');
}

export async function createWorkflowTemplate(name: string) {
  const templates = await readTemplates();
  const newTemplate: WorkflowTemplate = {
    id: `wf-${Date.now()}`,
    name,
    status: 'active',
    updatedAt: new Date().toISOString().slice(0, 10),
    steps: [],
  };
  await writeTemplates([...templates, newTemplate]);
  return newTemplate;
}

export async function updateWorkflowTemplateStatus(
  id: string,
  status: WorkflowTemplate['status'],
) {
  const templates = await readTemplates();
  const updated = templates.map((wf) =>
    wf.id === id
      ? { ...wf, status, updatedAt: new Date().toISOString().slice(0, 10) }
      : wf,
  );
  await writeTemplates(updated);
}
