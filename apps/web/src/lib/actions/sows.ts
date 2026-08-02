'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import type { Sow } from '@/lib/data/sows';

const DATA_FILE = path.join(process.cwd(), 'src/lib/data/sows.ts');

const ARRAY_PATTERN = /export const sows: Sow\[\] = (\[[\s\S]*?\n\]);/;

async function readSows() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const match = raw.match(ARRAY_PATTERN);
  if (!match) {
    throw new Error('Could not locate sows array in sows.ts');
  }
  const sows: Sow[] = new Function(`"use strict"; return (${match[1]});`)();
  return { raw, match, sows };
}

async function writeSows(raw: string, match: RegExpMatchArray, sows: Sow[]) {
  const updatedArray = `export const sows: Sow[] = ${JSON.stringify(sows, null, 2)};`;
  const start = match.index ?? 0;
  const end = start + match[0].length;
  const content = raw.slice(0, start) + updatedArray + raw.slice(end);
  await fs.writeFile(DATA_FILE, content, 'utf-8');
}

interface NewSowInput {
  title: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  creator: string;
  templateName?: string;
  templateId?: string;
  placeholderValues?: Record<string, string>;
  documentHtml?: string;
}

function buildNewSow(input: NewSowInput, sowCount: number): Sow {
  const today = new Date().toISOString().slice(0, 10);
  const number = `SOW-${1000 + sowCount + 1}`;
  return {
    id: `sow-${Date.now()}`,
    number,
    title: input.title,
    clientId: input.clientId,
    clientName: input.clientName,
    projectId: input.projectId,
    projectName: input.projectName,
    status: 'draft',
    version: 1,
    updatedAt: today,
    creator: input.creator,
    workflowTemplateName: '',
    sections: {
      objectives: '',
      scope: '',
      deliverables: [],
      milestones: [],
      periodStart: '',
      periodEnd: '',
      acceptanceCriteria: '',
      dependencies: '',
      risks: '',
      assumptions: '',
      notes: '',
      pricing: [],
    },
    revisions: [
      {
        id: `${number}-r1`,
        version: 1,
        submittedAt: null,
        status: 'draft',
        workflowInstanceSteps: [],
      },
    ],
    templateName: input.templateName,
    templateId: input.templateId,
    placeholderValues: input.placeholderValues,
    documentHtml: input.documentHtml,
  };
}

export async function createDraftSow(input: NewSowInput): Promise<Sow> {
  const { raw, match, sows } = await readSows();
  const sow = buildNewSow(input, sows.length);
  sows.push(sow);
  await writeSows(raw, match, sows);
  revalidatePath('/participant/my-sows');
  return sow;
}

export async function publishSow(
  input: NewSowInput,
  workflowTemplateId: string,
  workflowTemplateName: string,
): Promise<Sow> {
  const { raw, match, sows } = await readSows();
  const sow = buildNewSow(input, sows.length);
  const today = new Date().toISOString().slice(0, 10);
  sow.workflowTemplateId = workflowTemplateId;
  sow.workflowTemplateName = workflowTemplateName;
  sow.status = 'in_review';
  sow.updatedAt = today;
  const latestRevision = sow.revisions[sow.revisions.length - 1];
  if (latestRevision) {
    latestRevision.submittedAt = today;
    latestRevision.status = 'in_review';
  }
  sows.push(sow);
  await writeSows(raw, match, sows);
  revalidatePath('/participant/my-sows');
  revalidatePath('/participant/approvals');
  return sow;
}

export async function decideSow(
  id: string,
  decision: 'approved' | 'rejected' | 'changes_requested',
  input: { actor: string; comment?: string },
) {
  const { raw, match, sows } = await readSows();
  const sow = sows.find((s) => s.id === id);
  if (!sow) return;
  const now = new Date();
  const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
  sow.status = decision;
  sow.updatedAt = now.toISOString().slice(0, 10);
  const latestRevision = sow.revisions[sow.revisions.length - 1];
  if (latestRevision) {
    latestRevision.status = decision;
    latestRevision.workflowInstanceSteps.push({
      id: `wis-${Date.now()}`,
      name:
        decision === 'approved'
          ? 'Approval'
          : decision === 'rejected'
            ? 'Rejection'
            : 'Changes Requested',
      actor: input.actor,
      status: decision,
      comment: input.comment,
      decidedAt: timestamp,
    });
  }
  await writeSows(raw, match, sows);
  revalidatePath('/participant/approvals');
  revalidatePath(`/participant/approvals/${id}`);
  revalidatePath('/participant/my-sows');
  revalidatePath(`/participant/my-sows/${id}`);
}
