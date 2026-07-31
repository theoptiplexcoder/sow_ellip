'use server';

import fs from 'fs/promises';
import path from 'path';

export async function saveTemplatesToFile(templates: any[]) {
  const filePath = path.join(process.cwd(), 'src/components/admin/sows/savedTemplates.ts');
  
  const content = `// This file is auto-generated for persistence
export const SAVED_TEMPLATES: any[] = ${JSON.stringify(templates, null, 2)};
`;

  await fs.writeFile(filePath, content, 'utf-8');
}
