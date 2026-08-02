import mammoth from 'mammoth';

const PLACEHOLDER_PATTERN = /\{\{[^}]+\}\}/g;

export async function parseDocxFile(
  file: File,
): Promise<{ html: string; placeholders: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const [{ value: html }, { value: rawText }] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer }),
    mammoth.extractRawText({ arrayBuffer }),
  ]);
  const placeholders = Array.from(
    new Set(rawText.match(PLACEHOLDER_PATTERN) ?? []),
  );
  return { html, placeholders };
}
