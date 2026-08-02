import type { Sow } from '@/lib/data/sows';

const PLACEHOLDER_PATTERN = /\{\{[^}]+\}\}/g;

/** Renders a SOW as document HTML — the generated document if one exists, otherwise the structured sections. */
export function sowToHtml(sow: Sow): string {
  if (sow.documentHtml)
    return sow.documentHtml.replace(PLACEHOLDER_PATTERN, '');

  const s = sow.sections;
  return `
    <h1>${sow.number} — ${sow.title}</h1>
    <p>${sow.clientName} · ${sow.projectName}</p>
    <h2>Objectives</h2>
    <p>${s.objectives || '—'}</p>
    <h2>Scope</h2>
    <p>${s.scope || '—'}</p>
    <h2>Deliverables</h2>
    <ul>${s.deliverables.map((d) => `<li>${d}</li>`).join('') || '<li>—</li>'}</ul>
    <h2>Milestones</h2>
    <table>
      <tr><th>Milestone</th><th>Due Date</th></tr>
      ${s.milestones.map((m) => `<tr><td>${m.name}</td><td>${m.dueDate}</td></tr>`).join('')}
    </table>
    <h2>Period of Performance</h2>
    <p>${s.periodStart || '—'} to ${s.periodEnd || '—'}</p>
    <h2>Acceptance Criteria</h2>
    <p>${s.acceptanceCriteria || '—'}</p>
    <h2>Dependencies</h2>
    <p>${s.dependencies || '—'}</p>
    <h2>Risks</h2>
    <p>${s.risks || '—'}</p>
    <h2>Assumptions</h2>
    <p>${s.assumptions || '—'}</p>
    <h2>Pricing</h2>
    <table>
      <tr><th>Item</th><th>Amount</th></tr>
      ${s.pricing.map((p) => `<tr><td>${p.item}</td><td>${p.amount}</td></tr>`).join('')}
    </table>
    <h2>Notes</h2>
    <p>${s.notes || '—'}</p>
  `.trim();
}
