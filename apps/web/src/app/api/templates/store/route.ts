import { upsertStoredTemplate } from '@/lib/data/templates-store.server';
import type { Template } from '@/lib/data/templates';

export async function POST(request: Request) {
  const template = (await request.json()) as Template;
  if (!template?.id) {
    return Response.json(
      { error: 'A template with an id is required' },
      { status: 400 },
    );
  }
  await upsertStoredTemplate(template);
  return Response.json({ ok: true });
}
