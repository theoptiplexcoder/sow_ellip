export function placeholderLabel(token: string) {
  return token
    .replace(/^\{\{|\}\}$/g, '')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function fillPlaceholders(
  bodyHtml: string,
  values: Record<string, string>,
) {
  let html = bodyHtml;
  for (const [token, value] of Object.entries(values)) {
    if (!value) continue;
    html = html.split(token).join(value);
  }
  return html;
}
