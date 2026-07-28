# Application Flow

## Signup → Super Admin Approval → Organization Creation
1. A prospective customer signs up by providing: organization name, organization slug (unique platform-wide, used for tenant-aware links), their own name, email, phone, and password.
2. This creates a Supabase Auth credential and an `OrganizationSignupRequest` row in status `PENDING` — **no `Organization` row exists yet**, and the new credential has no `organization_id` claim, so it cannot log into anything.
3. A Super Admin (a single seeded platform account, not part of any organization) reviews the request and approves or rejects it:
   - **Approve** → provisions the `Organization` row, sets the `organization_id` claim on the pending auth user, creates their `public.users` row as `ADMIN`.
   - **Reject** → the request is marked `REJECTED`; the auth credential is kept for audit but never gains an `organization_id` claim.
4. All subsequent users for an approved org are still **invited** by an existing Admin via Users management, not self-registered. This closes off an arbitrary signer-upper landing in someone else's org.

## Login
1. A single login page with email and password (OTP deferred to backlog) for organization users.
2. All organization users, across all organizations, log in through the same page. Which organization's data they see is determined entirely server-side by their account's organization membership — never by anything the client sends.
3. A `PENDING` or `REJECTED` signup request gets a distinct "awaiting approval" / "not approved" message on login attempt, never a generic auth failure.
4. The Super Admin logs in through a separate, unlisted page with its own credentials — never the org login page.

## Core User Journey
```
Sign up (creates OrganizationSignupRequest, status PENDING)
  → Super Admin approves (provisions Organization + Admin user)
  → Admin logs in → Invite teammates (Creator / Approver / Viewer)
  → Create/select Client
  → Create/select Project
  → Create SOW (from template or blank)
  → Fill Scope / Deliverables / Milestones / Pricing
  → Attach sequential workflow
  → Submit (workflow snapshotted onto the SOW)
  → Approver(s) act: Approve / Reject / Request Changes
  → next step activates, or SOW resolves (Approved / Rejected)
  → Approved SOW → Print / Export PDF
```

Secondary journeys: dashboard visibility for Admin/Viewer (scoped to their org only); template reuse for Creators within their org.

## Screen-by-Screen

**Signup / Login `(auth)`**
- Signup form (org name, slug(automatically generated and unique), admin details(name, email, phone, password)) — submits an `OrganizationSignupRequest`, shows a "request submitted, awaiting approval" confirmation rather than logging the user in
- Login form (email, password) — surfaces a pending/rejected message if the account has no approved org yet

**Super Admin Console `(superadmin)`** — separate, unlisted login; not part of the org app shell
- Super Admin login (own credentials, seeded at deploy time — no signup UI)
- Signup requests queue: Pending / Approved / Rejected, filterable
- Request detail: org name, slug, admin name/email/phone, submitted date; Approve / Reject actions (reject requires a reason, stored for audit)

**Onboarding `(onboarding)`** — shown only to a brand-new org with no data yet
- Confirm org details
- Invite teammates by email + role

**Dashboard `(dashboard)`**
- Counts: My Drafts, Pending My Approval, Submitted, Approved, Rejected, Recently Updated
- All counts/lists implicitly scoped to the caller's organization

**Clients**
- List / create / edit; block hard delete if projects exist

**Projects**
- List / create / edit; linked to client + owner (both must be same org as project); status + expected dates
- Creating a project auto-assigns its owner the `CREATOR` role on that project (the project's admin)
- Project detail includes a **Members** tab: list org users and their role (`CREATOR`/`APPROVER`/`VIEWER`) on this project, with unassigned org users shown as implicit `VIEWER`; assign/change a user's role here (one role per user per project — changing it replaces the prior role). Visible to that project's `CREATOR`(s) and org Admins.

**Templates**
- List / create / edit / duplicate / archive; default section text for overview/objectives/scope/assumptions/terms

**Workflows**
- List / create / edit; ordered steps, assigned approver per step (must be same org — a workflow is a reusable org-scoped template, not tied to one project, so the approver's `APPROVER`/`CREATOR` role on the eventual project isn't checked here, only at submit); reorder; activate

**SOW Builder**
- Draft creation from template or blank; structured fields only (no rich text): title, SOW number, overview, objectives, in/out of scope, deliverables, milestones, assumptions, dependencies, acceptance criteria, pricing, payment terms, T&Cs
- Editable only in DRAFT/CHANGES_REQUESTED; core fields lock after submit; version increments on resubmission

**Approvals**
- Pending queue (scoped to the approver's org and assignment)
- Step detail: Approve / Reject / Request Changes, with mandatory comment on rejection/change request

**Print / Export**
- `/sows/[id]/print` — print CSS + browser "Save as PDF"; re-verifies requester's org matches the SOW's org before rendering

**Audit Log**
- Append-only list of system-generated events, filterable, scoped to the caller's org

## Role-Based View Summary

| Persona | Key Actions |
|---|---|
| Organization Admin (org-wide) | Invite/manage users, create clients/templates — own org only. Needs a per-project role like anyone else to create/edit SOWs or approve on a specific project. |
| Creator (per project) | Create clients/projects that become theirs, draft & submit SOWs, build/attach workflows, view audit logs, assign Approver/Viewer roles — only on projects where they hold Creator (always true for that project's owner) |
| Approver (per project) | Approve, reject, request changes on assigned steps, view audit logs — only on projects where they hold Approver |
| Viewer (per project, and the default) | View dashboard, SOWs, audit history — on projects where they hold Viewer, or by default on any project in their org with no explicit role assigned |
| Super Admin | Approve/reject organization signup requests only — no access to any org's tenant data |

A single user can appear in more than one row at once, depending on the project — e.g. Creator on Project 1, Approver on Project 2, Viewer (by default) on Project 3.

## Cross-Tenant Behavior (what should visibly happen)
- A user never sees another organization's clients, projects, templates, workflows, SOWs, or audit entries in any list.
- Navigating directly to another org's resource by ID/URL returns a 404 (not a permission error) — same as if it never existed.
- An Admin has no "view all organizations" mode. The Super Admin is the one persona that spans organizations, but only for signup-request review — it has no screen, endpoint, or query path into any organization's clients, projects, templates, workflows, SOWs, users, or audit logs.
- Per-project roles (Creator/Approver/Viewer) never widen a user's reach past their own organization — they only govern what a member can do *within* the projects of the org they already belong to.
