import PizZip from 'pizzip';

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const DOCUMENT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const CORE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>SOW Platform Template</dc:title>
  <dc:creator>SOW Platform</dc:creator>
</cp:coreProperties>`;

const APP_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>SOW Platform</Application>
</Properties>`;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="200" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="160" w:after="80"/><w:outlineLvl w:val="2"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
  </w:style>
</w:styles>`;

const NUMBERING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val=""/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
      <w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="decimal"/>
      <w:lvlText w:val="%1."/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
  <w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>`;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function runsFromInline(node: Node, forceBold = false): string {
  let xml = '';

  function walk(n: Node, bold: boolean, italic: boolean) {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.textContent ?? '';
      if (!text) return;
      const rPr =
        bold || italic
          ? `<w:rPr>${bold ? '<w:b/>' : ''}${italic ? '<w:i/>' : ''}</w:rPr>`
          : '';
      xml += `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      return;
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as Element;
      const tag = el.tagName.toLowerCase();
      if (tag === 'br') {
        xml += '<w:r><w:br/></w:r>';
        return;
      }
      const nextBold = bold || tag === 'strong' || tag === 'b';
      const nextItalic = italic || tag === 'em' || tag === 'i';
      el.childNodes.forEach((child) => walk(child, nextBold, nextItalic));
    }
  }

  node.childNodes.forEach((child) => walk(child, forceBold, false));
  return xml || '<w:r><w:t></w:t></w:r>';
}

function paragraphXml(
  el: Element,
  opts: { numId?: number; ilvl?: number } = {},
): string {
  const tag = el.tagName.toLowerCase();
  let pStyle = '';
  if (/^h[1-6]$/.test(tag)) {
    const level = Math.min(3, Number(tag[1]));
    pStyle = `<w:pStyle w:val="Heading${level}"/>`;
  } else if (opts.numId) {
    pStyle = `<w:pStyle w:val="ListParagraph"/>`;
  }
  const numPr = opts.numId
    ? `<w:numPr><w:ilvl w:val="${opts.ilvl ?? 0}"/><w:numId w:val="${opts.numId}"/></w:numPr>`
    : '';
  const pPr = pStyle || numPr ? `<w:pPr>${pStyle}${numPr}</w:pPr>` : '';
  return `<w:p>${pPr}${runsFromInline(el)}</w:p>`;
}

function tableXml(tableEl: Element): string {
  const rows = Array.from(tableEl.querySelectorAll('tr'));
  const colCount = Math.max(...rows.map((r) => r.children.length), 1);
  const colWidth = Math.floor(9350 / colCount);
  const gridCols = Array.from({ length: colCount })
    .map(() => `<w:gridCol w:w="${colWidth}"/>`)
    .join('');
  const border =
    '<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>';

  const rowsXml = rows
    .map((row) => {
      const cellsXml = Array.from(row.children)
        .map((cell) => {
          const isHeader = cell.tagName.toLowerCase() === 'th';
          const cellPara = `<w:p>${runsFromInline(cell, isHeader)}</w:p>`;
          return `<w:tc><w:tcPr><w:tcW w:w="${colWidth}" w:type="dxa"/></w:tcPr>${cellPara}</w:tc>`;
        })
        .join('');
      return `<w:tr>${cellsXml}</w:tr>`;
    })
    .join('');

  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>${border}</w:tblBorders></w:tblPr><w:tblGrid>${gridCols}</w:tblGrid>${rowsXml}</w:tbl>`;
}

function blockXml(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag) || tag === 'p') {
    return paragraphXml(el);
  }
  if (tag === 'ul' || tag === 'ol') {
    const numId = tag === 'ul' ? 1 : 2;
    return Array.from(el.children)
      .filter((c) => c.tagName.toLowerCase() === 'li')
      .map((li) => paragraphXml(li, { numId }))
      .join('');
  }
  if (tag === 'table') {
    return tableXml(el);
  }
  if (tag === 'blockquote') {
    const inner = Array.from(el.children).map(blockXml).join('');
    return inner || paragraphXml(el);
  }
  return `<w:p>${runsFromInline(el)}</w:p>`;
}

export async function generateDocxBlob(html: string): Promise<Blob> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const bodyXml =
    Array.from(doc.body.children).map(blockXml).join('') || '<w:p/>';

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zip = new PizZip();
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', RELS_XML);
  zip.file('docProps/core.xml', CORE_XML);
  zip.file('docProps/app.xml', APP_XML);
  zip.file('word/document.xml', documentXml);
  zip.file('word/styles.xml', STYLES_XML);
  zip.file('word/numbering.xml', NUMBERING_XML);
  zip.file('word/_rels/document.xml.rels', DOCUMENT_RELS_XML);

  return zip.generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  }) as Blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
