import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function safeFileName(name: string) {
  const base = name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  return `${Date.now()}-${base}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.docx')) {
    return Response.json(
      { error: 'A .docx file is required' },
      { status: 400 },
    );
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  const fileName = safeFileName(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, fileName), buffer);

  return Response.json({ url: `/uploads/${fileName}`, name: file.name });
}
