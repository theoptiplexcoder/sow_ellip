import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Template } from './templates';

const STORE_DIR = path.join(process.cwd(), 'public', 'uploads');
const STORE_FILE = path.join(STORE_DIR, 'templates-store.json');

/** Templates created or edited at runtime (e.g. via "New Template"), persisted to disk so
 *  the server-rendered detail page can find them — the in-memory seed array only lives in
 *  the browser's copy of the module. */
export async function readStoredTemplates(): Promise<Template[]> {
  try {
    const raw = await readFile(STORE_FILE, 'utf-8');
    return JSON.parse(raw) as Template[];
  } catch {
    return [];
  }
}

export async function upsertStoredTemplate(template: Template): Promise<void> {
  const stored = await readStoredTemplates();
  const next = [...stored.filter((t) => t.id !== template.id), template];
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(next, null, 2));
}

export async function getStoredTemplate(
  id: string,
): Promise<Template | undefined> {
  const stored = await readStoredTemplates();
  return stored.find((t) => t.id === id);
}
