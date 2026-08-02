export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  const formData = new FormData();
  formData.append(
    'files',
    new Blob([new Uint8Array(docxBuffer)]),
    'document.docx',
  );

  const response = await fetch(
    `${process.env['GOTENBERG_URL']}/forms/libreoffice/convert`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok)
    throw new Error(`Gotenberg conversion failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
