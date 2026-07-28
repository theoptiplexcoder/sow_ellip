# Phase & Scope

## Product Scope
**In scope:** organization signup request + Super Admin approval/rejection, structured SOW capture, reusable templates, ordered/sequential approvals, state transitions, print-to-PDF export, audit logs — all scoped per organization (except the Super Admin console, which is deliberately org-agnostic and limited to signup-request review).

**Out of scope (backlog):** e-signatures, notifications, conditional/parallel approvals, external client portal, CRM integration, server-side PDF binaries, version diffing, cross-organization collaboration, users belonging to more than one organization.

## Timeline
5 days total (bumped from an original 4-day single-tenant estimate — RLS policies, the auth-provisioning trigger, org signup, and a dedicated cross-tenant test suite are load-bearing work, not a UI add-on).

## Sprint Plan

| Day | Focus | Key Deliverables |
|---|---|---|
| 1 | Tenancy foundation | Nx + Next.js + Supabase Postgres/Auth setup; `Organization` + `OrganizationSignupRequest` + `SuperAdmin` models + migration; `current_org_id()` function and RLS policies on every tenant-scoped table; `handle_new_auth_user` trigger (claim-gated); org signup flow creating a `PENDING` request; seeded Super Admin account (env-based) and its approve/reject flow provisioning org + Admin user; seeded demo data for **two** approved organizations |
| 2 | Auth + business objects | Login/logout/session; `proxy.ts` tenant-context resolution; protected dashboard scoped per org; Client/Project/Template CRUD (org-scoped); `ProjectMember` model + RLS + auto-`CREATOR`-on-create; project Members tab (assign Creator/Approver/Viewer, implicit Viewer default); SOW draft create/edit; first pass of cross-tenant integration tests |
| 3 | Workflow engine | Workflow builder (approver-must-be-same-org validation; APPROVER/CREATOR ProjectRole re-checked against the SOW's project at submit), submit flow with workflow snapshotting, approval queue + approve/reject/request-changes actions with row-level locking, audit logging with `organization_id` on every entry |
| 4 | Isolation hardening + QA | Full cross-tenant RLS test suite as its own CI job; verify no code path lets Admin see another org's data; verify SOW-number/template-name uniqueness are per-org; fix any RLS/query gaps found |
| 5 | Finish & deploy | Print route, dashboard counts, general QA, Vercel deploy, seed data for both demo orgs, README/ERD/API list/demo script, final walkthrough of "log in as Org B, confirm none of Org A's data is visible" |

### Definition of done per day
- **Day 1:** a second organization can submit a signup request independently; the Super Admin can see it in the queue, approve it, and its Admin can then log in to an empty dashboard (login before approval is rejected with a pending message).
- **Day 2:** an Org A user hitting `/api/clients/[id]` for an Org B client ID gets a 404.
- **Day 3:** an approver from Org B cannot be assigned to an Org A workflow; a workflow step's approver who lacks APPROVER/CREATOR ProjectRole on the SOW's specific project is rejected at submit with 422.
- **Day 4:** the cross-tenant CI job is red if any table's RLS policy is missing or misconfigured — the sprint's hard gate before polish.
- **Day 5:** all acceptance criteria below are met, including the two-organization demo script.

## Acceptance Criteria (MVP Done When)
- Signup creates a `PENDING` OrganizationSignupRequest; login is rejected until a Super Admin approves it
- Super Admin approval provisions the Organization and its first Admin user; rejection permanently blocks that credential from ever logging into an org
- Super Admin has no query path into any organization's tenant data (clients, projects, templates, workflows, SOWs, audit logs) — verified by the cross-tenant test suite
- Auth: login/logout/session persistence works
- Authorization: role-gated screens and actions enforced, scoped to the caller's organization **and**, for project-scoped actions, to the caller's `ProjectRole` (Creator/Approver/Viewer) on that specific project
- RLS policies exist on every tenant-scoped table (including `project_member`) and are covered by automated cross-tenant tests
- Creating a project auto-assigns its owner `CREATOR` on that project; a user with no explicit `ProjectMember` row defaults to `VIEWER` (can view, cannot create/edit/approve)
- A user can hold different `ProjectRole`s on different projects (e.g. Creator on one, Approver on another, Viewer on a third) — one role per user per project
- Creator can create, save, edit a draft SOW within a project where they hold `CREATOR`
- Workflow with ≥1 ordered approver (same org) can be defined and reused; each approver's `APPROVER`/`CREATOR` `ProjectRole` on the SOW's project is validated at submit, not at workflow-save time
- Submit snapshots the workflow; approvals proceed sequentially
- Request-changes returns SOW to creator for edit/resubmit
- Rejection halts the workflow
- Final approval marks SOW approved
- Approved SOW exports to PDF via print view
- All state-changing actions are audit-logged with organization_id
- App is live on a public Vercel URL with working managed Supabase Postgres
- README, ERD, API list, seed credentials (for at least two demo orgs), and demo script are delivered

## Demo Data & Script
Seed: one Super Admin account, **two approved organizations**, each with 1 org Admin + 3 other users, 3 clients, 3 projects, 2 templates, 2 workflows, 3 SOWs in varied statuses — project roles assigned so each of the 3 projects demonstrates a different `ProjectRole` mix (e.g. a user who is `CREATOR` on one project, `APPROVER` on another, and implicit `VIEWER` on the third). A third, still-`PENDING` signup request is also seeded to demo the approval queue.

Flow: log in as Super Admin → approve the pending signup request (its org now exists) → sign up / log in as Org A's first Admin (auto-Creator on no projects yet) → create client/project (owner auto-assigned `CREATOR` on it) → open the project's Members tab, assign a second user `APPROVER` on this project → create SOW from template → add deliverable + milestone → attach workflow → submit (approver's `APPROVER` ProjectRole validated against this project) → approve as Approver 1 → request changes as Approver 2 → creator edits & resubmits → approve through final step → open print view → export PDF → review audit history → **log in as Org B and confirm none of Org A's data, projects, or role assignments are visible or reachable by direct link** → confirm the Super Admin session cannot reach any of Org A's or Org B's tenant screens/APIs.

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
