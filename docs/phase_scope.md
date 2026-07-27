# Phase & Scope

## Product Scope
**In scope:** organization signup/provisioning, structured SOW capture, reusable templates, ordered/sequential approvals, state transitions, print-to-PDF export, audit logs — all scoped per organization.

**Out of scope (backlog):** e-signatures, notifications, conditional/parallel approvals, external client portal, CRM integration, server-side PDF binaries, version diffing, cross-organization collaboration, users belonging to more than one organization.

## Timeline
5 days total (bumped from an original 4-day single-tenant estimate — RLS policies, the auth-provisioning trigger, org signup, and a dedicated cross-tenant test suite are load-bearing work, not a UI add-on).

## Sprint Plan

| Day | Focus | Key Deliverables |
|---|---|---|
| 1 | Tenancy foundation | Nx + Next.js + Supabase Postgres/Auth setup; `Organization` model + migration; `current_org_id()` function and RLS policies on every tenant-scoped table; `handle_new_auth_user` trigger; org signup flow provisioning org + Admin user; seeded demo data for **two** organizations |
| 2 | Auth + business objects | Login/logout/session; `proxy.ts` tenant-context resolution; protected dashboard scoped per org; Client/Project/Template CRUD (org-scoped); SOW draft create/edit; first pass of cross-tenant integration tests |
| 3 | Workflow engine | Workflow builder (approver-must-be-same-org validation), submit flow with workflow snapshotting, approval queue + approve/reject/request-changes actions with row-level locking, audit logging with `organization_id` on every entry |
| 4 | Isolation hardening + QA | Full cross-tenant RLS test suite as its own CI job; verify no code path lets Admin see another org's data; verify SOW-number/template-name uniqueness are per-org; fix any RLS/query gaps found |
| 5 | Finish & deploy | Print route, dashboard counts, general QA, Vercel deploy, seed data for both demo orgs, README/ERD/API list/demo script, final walkthrough of "log in as Org B, confirm none of Org A's data is visible" |

### Definition of done per day
- **Day 1:** a second organization can sign up independently and its Admin sees an empty dashboard.
- **Day 2:** an Org A user hitting `/api/clients/[id]` for an Org B client ID gets a 404.
- **Day 3:** an approver from Org B cannot be assigned to an Org A workflow.
- **Day 4:** the cross-tenant CI job is red if any table's RLS policy is missing or misconfigured — the sprint's hard gate before polish.
- **Day 5:** all acceptance criteria below are met, including the two-organization demo script.

## Acceptance Criteria (MVP Done When)
- Signup provisions a new Organization and its first Admin user
- Auth: login/logout/session persistence works
- Authorization: role-gated screens and actions enforced, scoped to the caller's organization
- RLS policies exist on every tenant-scoped table and are covered by automated cross-tenant tests
- Creator can create, save, edit a draft SOW within their org
- Workflow with ≥1 ordered approver (same org) can be defined and reused
- Submit snapshots the workflow; approvals proceed sequentially
- Request-changes returns SOW to creator for edit/resubmit
- Rejection halts the workflow
- Final approval marks SOW approved
- Approved SOW exports to PDF via print view
- All state-changing actions are audit-logged with organization_id
- App is live on a public Vercel URL with working managed Supabase Postgres
- README, ERD, API list, seed credentials (for at least two demo orgs), and demo script are delivered

## Demo Data & Script
Seed: **two organizations**, each with 4 users (one per role), 3 clients, 3 projects, 2 templates, 2 workflows, 3 SOWs in varied statuses.

Flow: sign up / log in as Org A Creator → open client/project → create SOW from template → add deliverable + milestone → attach workflow → submit → approve as Approver 1 → request changes as Approver 2 → creator edits & resubmits → approve through final step → open print view → export PDF → review audit history → **log in as Org B and confirm none of Org A's data is visible or reachable by direct link.**

## Testing Plan

| Test layer | Scope | Minimum for MVP |
|---|---|---|
| Unit | Validation, state transitions, RBAC guards, `current_org_id()` resolution | Required |
| Integration | Route Handlers + DB for critical flows | Required |
| Cross-tenant isolation | RLS policies, direct-ID access across orgs | Required |
| UI smoke | Signup, login, create SOW, submit, approve, print | Required |
| End-to-end | One happy path in Playwright if time allows | Optional but recommended |

## CI/CD
- `nx affected -t lint`
- `nx affected -t test`
- `nx affected -t build`
- dedicated cross-tenant RLS test job (separate from general `test`)

## Post-MVP Backlog
External client portal, email notifications, parallel/conditional approvals, server-side PDF binaries, e-signatures, clause library, version diffing, SLA/escalation, full-text search, users belonging to multiple organizations, self-serve org switching, custom domains per org.
