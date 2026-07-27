## PRODUCT GOAL
The product goal is deliberately narrow: let any number of separate organizations each create structured SOWs, assign a configurable sequential approval workflow, move the SOW through approve / reject / request changes, export a print-ready PDF, and review an audit trail — **with each organization's data fully isolated from every other organization's.** This reflects how work statements are used in practice: the work statement must clearly describe the work, period of performance, deliverable schedule, and related performance requirements, so the MVP focuses on structured capture of exactly those items rather than on a generic rich-text editor or a full contract-lifecycle platform. It is explicitly a **multi-tenant SaaS** product, not a single-org internal tool — tenant isolation is a day-one requirement, not a later hardening pass.

## APPLICATION FLOW
Prospective customer signs up → their **Organization** is created and they become that org's Admin → they invite teammates (Creator/Approver/Viewer roles) → the org's users create clients, projects, templates, and workflows scoped only to that org → SOWs move through drafting, submission, sequential approval, and export, visible only to members of that organization.

## USER PERSONAS

1. ORGANIZATION ADMIN — created automatically at signup; manages users/roles/templates/workflows for their own organization only
2. SOW CREATOR
3. APPROVER
4. EXECUTIVE VIEWER

All four personas exist **within** a single organization; there is no persona that spans multiple organizations in the MVP.

## SIGNUP (Organization Creation)
1. A prospective customer signs up by providing: organization name, organization slug (used for tenant-aware links; must be unique platform-wide), their own name, email, phone, and password.
2. This single action provisions a new `Organization` row and makes the signing-up user its Admin — there is no separate "register as a standalone user" path with no org attached.
3. All subsequent users for that organization are **invited** by an existing Admin (via Users management), not self-registered — this prevents an arbitrary signer-upper from landing in someone else's org by guessing an invite-less flow.

## LOGIN
1. A single login page with email and password (OTP deferred to backlog).
2. All users, across all organizations, log in through the same page; which organization's data they see is determined entirely server-side by their account's organization membership, never by anything the client sends.

## DASHBOARD
*(all lists and actions below are implicitly scoped to the logged-in user's own organization)*

1. ADMIN
   Create/edit clients, create/edit projects, create/edit templates, create/edit SOW drafts, submit SOW, build workflows, approve assigned step, reject/request changes on assigned step, view audit logs, manage users/roles — **for their organization only.**

2. SOW Creator
   Log in, create/edit clients, create/edit projects, create/edit templates, create/edit SOW drafts, submit SOW, build workflows, view audit logs — **for their organization only.**

3. APPROVER
   Log in, approve assigned step, reject/request changes on assigned step, view audit logs — **for their organization only;** a user can never be assigned as approver on a workflow belonging to a different organization.

4. EXECUTIVE VIEWER
   View audit logs — **for their organization only.**

## Features and considerations by capability area
- **Organizations (new)** — created at signup; slug uniqueness; no self-serve deletion in MVP.
- **Auth** — Login, logout, current-user session (includes organization ID), protected routes, session expiry, seeded demo users **across at least two separate demo organizations** so isolation can be demonstrated.
- **Users and RBAC** — Admin can list users, create user, deactivate user, assign role — **scoped to the admin's own organization**; authorization on every mutation checks both role and organization membership.
- **Clients** — Create, edit, list, view details, soft delete optional — scoped per organization.
- **Projects** — Create, edit, list, link to client, owner, status; portfolio planning — client and owner must belong to the same organization as the project.
- **Templates** — Create blank template, edit default section text, duplicate, activate/deactivate — scoped per organization; names unique per org, not globally.
- **SOW builder** — Create draft, edit sections, add deliverables and milestones, save draft, preview — SOW numbers unique per organization.
- **Workflow builder** — Create named workflow, define ordered steps, assign users (same org only), reorder, activate.
- **Approvals** — Pending queue, step detail, approve/reject/request changes, mandatory comment on rejection/change request — queue is implicitly scoped to the approver's own organization.
- **PDF export** — Print-ready page with branded layout and browser Save as PDF; page re-checks the requester's organization matches the SOW's before rendering.
- **Audit logs** — Append-only event entries for all state-changing actions, each entry tagged with the organization it belongs to.

## AUDIT LOGS
- ORGANIZATION_CREATED
- USER_LOGGED_IN
- USER_INVITED
- CLIENT_CREATED / UPDATED
- PROJECT_CREATED / UPDATED
- TEMPLATE_CREATED / UPDATED
- SOW_CREATED / UPDATED
- SOW_SUBMITTED
- APPROVAL_APPROVED
- APPROVAL_REJECTED
- APPROVAL_CHANGES_REQUESTED
- SOW_PRINT_VIEW_OPENED
- SOW_EXPORTED_TO_PDF

Every entry carries the acting user's `organization_id`, so audit queries never need to reason about cross-org leakage.

## NON-FUNCTIONAL: TENANT ISOLATION
- No query path may return rows from a different organization, under any role, including Admin. There is no "super admin sees all orgs" persona in the MVP.
- Direct object reference to another organization's resource (e.g. guessing a SOW ID) must return **404**, not 403, to avoid confirming existence.
- Isolation is enforced at the database layer via Postgres Row Level Security, not only in application code, and is covered by an explicit cross-tenant test suite (see `@/docs/prd.md` → Testing).
