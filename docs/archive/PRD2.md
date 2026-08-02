# Product Requirements Document: Statement of Work (SOW) Platform

**Status:** MVP Specification
**Document version:** 1.1 — updated persona model (3 personas; Creator/Approver/Executive Viewer are now project-level roles held by a Participant, not separate personas)

---

## 1. Vision

Build a deployable, small-team MVP for a **multi-tenant Statement of Work (SOW) platform**: structured SOW authoring, configurable sequential approval workflows, audit trail, and print-ready output — deliberately scoped _below_ a full Contract Lifecycle Management (CLM) platform.

The product focuses on exactly what a work statement needs to describe: the work, period of performance, deliverable schedule, and performance requirements — captured as structured data rather than free-form rich text.

**Target scale for MVP (first 6–12 months):** 10–50 tenants.

---

## 2. Architecture Overview

| Layer                     | Choice                                                                 | Notes                                                                                            |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Application               | Next.js (App Router), Nx monorepo, TypeScript                          | Deployed on **Vercel**                                                                           |
| Database                  | **Supabase Postgres**                                                  | Pooled connections (transaction mode) for app queries; direct connection reserved for migrations |
| Auth                      | **Better Auth**                                                        | Session-based, protected routes                                                                  |
| File storage              | **Supabase Storage**                                                   | Attachments, uploaded DOCX templates, generated DOCX/PDF outputs                                 |
| Background jobs           | **Inngest**                                                            | Durable, retryable multi-step workflows (DOCX pipeline)                                          |
| DOCX → PDF conversion     | **Self-hosted LibreOffice (via Gotenberg)**, deployed on Fly.io/Render | Not run on Vercel — LibreOffice requires a persistent container, not a serverless function       |
| Structured SOW PDF export | Print-optimized HTML + browser "Save as PDF"                           | No server-side rendering required for this path                                                  |

### Why these choices interact the way they do

- Vercel's serverless functions cannot run LibreOffice natively (no persistent binary environment), so DOCX→PDF conversion must live in a separate, always-on container reachable over HTTP.
- Serverless functions open new DB connections per invocation, so **connection pooling is mandatory, not optional**, at this scale — Supabase's built-in pooler handles this without extra infrastructure.
- The DOCX pipeline (extract placeholders → populate → generate DOCX → convert to PDF → log to audit) is multi-step and each step can fail independently (e.g., the conversion service times out). Inngest provides retryable, durable steps instead of hand-rolled retry logic inside a single request/response cycle.

---

## 3. Multi-Tenancy

Every business table includes a `tenant_id`. No query may skip tenant scoping — this is enforced at the query-builder/ORM layer, never left to UI filtering alone.

Tenant-scoped tables include:

- Users, Clients, Projects, **Project Role Assignments**, Templates, Template Versions
- Workflows, Workflow Versions, Workflow Steps
- SOWs, SOW Revisions
- Workflow Instances, Workflow Instance Steps
- Audit Logs, Attachments

---

## 4. Users & Personas

The platform has exactly **three personas**. Day-to-day work roles (creating SOWs, approving them, viewing dashboards read-only) are **not separate personas** — they are **project-level roles** that a Participant can hold, one or more at a time, scoped per project.

| Persona          | Scope                                                | Responsibilities                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Superadmin**   | Platform-wide                                        | Manages tenants: create/enable/disable tenants, manage Tenant Admins. No visibility into a tenant's SOW/workflow content itself.                                                                                                                                                                                                                                                                            |
| **Tenant Admin** | Single tenant                                        | Manages the tenant organization: users, Clients, Projects, **SOW (structured) templates**, **DOCX templates**, and **Workflow templates/definitions**. Assigns Participants to Projects and sets each Participant's project role(s).                                                                                                                                                                        |
| **Participant**  | Single tenant, scoped further to individual projects | The tenant's working members. A Participant is assigned one or more **project roles** per project: **Creator**, **Approver**, and/or **Executive Viewer**. Their permissions on any given SOW/workflow are derived from their role on that specific project — the same person can be a Creator on one project and an Approver (or Executive Viewer) on another, or hold multiple roles on the same project. |

### 4.1 Project Roles (held by Participants, per project)

| Project Role         | What it grants on that project                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Creator**          | Create clients/projects (if also granted at tenant level), create/edit SOW drafts, use templates, submit SOWs for approval |
| **Approver**         | Review assigned approvals; approve, reject, request changes; comment                                                       |
| **Executive Viewer** | Read-only dashboard, pipeline visibility, audit history for that project                                                   |

A Participant with no project role assignments on a given project has no access to that project's SOWs or workflows.

### RBAC

Authorization remains **permission-based** internally rather than hardcoded persona checks, so both personas and project roles resolve down to flexible permission sets.

Example permissions:

```
client:create        client:update
project:create        template:create
workflow:create        workflow:approve
audit:view             user:manage
```

Persona/project-role checks like `if persona == TenantAdmin` or `if projectRole == Approver` should not appear in application logic — permissions are resolved from the assignment, not string-matched against a role name.

**Permission resolution order:**

1. **Superadmin** permissions are platform-scoped and independent of any tenant.
2. **Tenant Admin** permissions are tenant-scoped (apply across all of that tenant's clients/projects/templates/workflows).
3. **Participant** permissions are resolved **per project**, from that Participant's project role assignment(s) on the specific project the action targets. A Participant's permission set can therefore differ from one project to the next.

---

## 5. Functional Requirements

### 5.1 Authentication

- Login / logout
- Current-user session
- Protected routes
- Session expiry
- Seeded demo users
- **Library:** Better Auth

### 5.2 Users, RBAC & Project Role Assignment

- Tenant Admin: list users, create user, deactivate user
- Tenant Admin: assign a Participant to one or more Projects, and set that Participant's project role(s) — Creator, Approver, Executive Viewer — per project (a Participant may hold different roles on different projects, or multiple roles on the same project)
- Authorization enforced on every mutation, not just at the route level, and always resolved against the specific project the mutation targets when the actor is a Participant
- Superadmin controls tenant-level access (enable/disable tenants and manage Tenant Admins) but has no direct role within a tenant's projects

### 5.3 Clients & Projects

- Tenant Admins manage Clients and Projects tenant-wide
- Participants with the Creator project role manage Clients/Projects they're assigned to, per Tenant Admin configuration
- Hierarchy: `Tenant → Client → Project → SOW`
- Project membership: each Project has one or more Participants, each with one or more project roles (Creator / Approver / Executive Viewer)

### 5.4 Templates

Two template concepts, kept clearly separated. Both are managed exclusively by the **Tenant Admin** persona, tenant-wide.

**Structured Templates**

- Created in-app by Tenant Admin
- Field/placeholder definitions with default values
- Structured SOW data is always the source of truth — a template edit never retroactively changes an already-generated SOW

**DOCX Templates**

- Tenant Admin uploads a `.docx` file with placeholders
- On upload: store original file → extract placeholders → validate → persist placeholder definitions → associate with a template version
- Template versioning: a generated SOW stores which template version it came from, not a live link to the current template

### 5.5 Workflow Templates

- Tenant Admin creates named, reusable **Workflow templates** (workflow definitions) tenant-wide
- Unlimited ordered steps, drag/button reorder, assign Participants (holding the Approver project role on the relevant project) per step
- Activate / deactivate / archive workflow templates tenant-wide
- Model: `Workflow → Workflow Version → Workflow Steps`
- **Editing a workflow template never affects in-flight approvals** — new submissions use the latest active version; approvals already underway continue on the version they started with

### 5.6 SOW Builder

- Available to Participants holding the Creator project role on the relevant project
- Create draft, save draft, preview, generate from template, edit structured sections
- Free-text sections that need rich formatting (Scope, Assumptions, Notes) are edited live in-app via **docx-editor.dev**, an in-browser WYSIWYG editor; all other sections remain plain structured fields — see `tech_stack.md` §2

Recommended structured sections:

```
Title                       Objectives
Client                      Scope
Project                     Deliverables
Background                  Milestones
Period of Performance       Performance Requirements
Acceptance Criteria         Assumptions
Dependencies                Risks
Pricing (optional)
```

### 5.7 SOW Revisions

- Every submission is an immutable revision: `SOW → Revision 1 → Revision 2 → Revision 3 …`
- "Request Changes" produces a new revision rather than editing history in place
- Each revision retains its own submission date, workflow instance, approval history, and generated outputs

### 5.8 Workflow Execution

- `Workflow Template → Workflow Version → Workflow Instance → Workflow Instance Steps`
- Actions per step, available to the Participant(s) holding the Approver project role assigned to that step: **Approve / Reject / Request Changes**
- Comments mandatory on Reject and Request Changes
- State transitions are system-driven — never manually edited by a user

### 5.9 SOW State Machine

```
Draft → Submitted → In Review → Approved
In Review → Rejected
In Review → Changes Requested → (new revision) → Draft → Submitted
Approved → Archived
```

Only these transitions are permitted; the application enforces this rather than trusting client input.

### 5.10 Document Generation Pipeline (Inngest-orchestrated)

Triggered on SOW approval or export request:

1. **Extract** — read structured SOW revision data
2. **Populate** — fill DOCX placeholders (if a DOCX template is attached) using the structured data
3. **Generate DOCX** — produce the filled `.docx`, store in Supabase Storage
4. **Convert to PDF** — call the self-hosted LibreOffice/Gotenberg service over HTTP with the generated DOCX; store resulting PDF in Supabase Storage
5. **Audit log** — record each step's completion/failure with metadata

Each step is independently retryable; a failure at step 4 (e.g., conversion service timeout) does not require re-running steps 1–3.

**Separate, always-on path:** the structured SOW itself can always be exported via the print-optimized HTML page (`/sows/[id]/print`) and the browser's native "Save as PDF" — this path has no dependency on Inngest or the conversion service and should remain available even if the DOCX pipeline is degraded.

### 5.11 Audit Log

Append-only. Every state-changing action creates an immutable entry.

Captured events include: SOW created, draft updated, submitted, workflow attached, step approved/rejected, changes requested, workflow completed, template updated, user role changed, project role assignment changed, client/project changes.

Fields:

```
tenant_id       actor_id        entity_type
entity_id       action          previous_state
new_state       timestamp       metadata (JSONB)
```

### 5.12 Dashboard

Dashboard views are determined by **persona**, and for Participants, further by the **project role(s)** they hold across their assigned projects (a Participant holding multiple roles, or roles on multiple projects, sees the union of the relevant views, scoped to the projects that role applies to).

| Persona      | Project Role (if Participant) | Views                                                                                         |
| ------------ | ----------------------------- | --------------------------------------------------------------------------------------------- |
| Superadmin   | —                             | Total Tenants, Active Tenants, Disabled Tenants, Total Users                                  |
| Tenant Admin | —                             | Active Users, Active Templates, Active Workflow Templates, Status Summary, Recent Activity    |
| Participant  | Creator                       | My Drafts, Submitted, Returned for Changes, Recently Updated (per assigned project)           |
| Participant  | Approver                      | Pending Approval, Approved Today, Rejected Today (per assigned project)                       |
| Participant  | Executive Viewer              | Pipeline by Status, Blocked SOWs, Average Approval Time, Audit History (per assigned project) |

---

## 6. Database Modules

```
core        tenants, users, personas, permissions
crm         clients, projects, project_role_assignments
templates   templates, template_versions
sow         sows, sow_revisions
workflow    workflows, workflow_versions, workflow_steps,
            workflow_instances, workflow_instance_steps
audit       audit_logs
storage     attachments
```

`project_role_assignments` is the new join table capturing `(tenant_id, project_id, user_id, project_role)`, where `project_role` is one of `creator | approver | executive_viewer`, and a user may have multiple rows (multiple roles, multiple projects).

## 7. Nx Monorepo Structure

```
apps/
  web/

libs/
  auth/
  db/
  ui/
  tenants/
  users/
  clients/
  projects/
  templates/
  sow/
  workflow/
  audit/
  dashboard/
  shared/
```

---

## 8. External Services Summary

| Service                 | Purpose                                        | Deployment                                |
| ----------------------- | ---------------------------------------------- | ----------------------------------------- |
| Supabase                | Postgres + connection pooling + object storage | Managed                                   |
| Better Auth             | Authentication                                 | In-app (Next.js)                          |
| Inngest                 | Durable background job orchestration           | Managed (webhook-triggered from Vercel)   |
| LibreOffice / Gotenberg | DOCX → PDF conversion                          | Self-hosted container on Fly.io or Render |

---

## 9. Design Principles

- PostgreSQL (via Supabase) is the single source of persistence.
- Structured SOW data is the canonical source of truth — DOCX is an import/export and presentation format, never the primary editing surface. (The in-app rich-text editor used for a handful of free-text fields is scoped to those fields only, not promoted to whole-document editing.)
- HTML print → browser PDF remains available independent of the DOCX/Inngest pipeline.
- Workflow templates are reusable and versioned; workflow instances are immutable once started.
- SOW revisions preserve every historical submission.
- Audit logs are append-only.
- Authorization is permission-based, not persona/role-string-based.
- **Only three personas exist platform-wide** — Superadmin, Tenant Admin, Participant. Creator/Approver/Executive Viewer are project-scoped role assignments held by Participants, not personas of their own, so the same person can hold different roles on different projects (or several roles on one project).
- Every query is tenant-aware; no cross-tenant access is possible even by omission.
- The MVP scope is deliberately SOW-focused, not a CLM platform.

---

## 10. Explicitly Out of Scope for MVP

- AI-generated SOWs
- Email/Slack/Teams notifications
- Digital/e-signatures
- OCR, contract comparison
- Real-time collaboration
- External (non-authenticated) approval links
- Elasticsearch-based search (basic `ILIKE` search is sufficient at this scale)

---

## 11. Open Decisions (not yet locked, non-blocking for architecture)

These don't change the core architecture above but should be decided before or during early build:

- **Tenant onboarding:** self-serve signup vs. Superadmin-provisioned only
- **Notifications:** confirm fully deferred to v2, including in-app notification badges
- **Testing strategy:** unit + integration coverage baseline; recommend Playwright end-to-end coverage specifically for the approval workflow, given it's the highest-risk business logic
- **Observability:** Vercel's built-in logging plus an error tracker (e.g., Sentry) so failures inside Inngest steps and the conversion service are visible, not silent
- **Optimistic locking:** version/`updated_at` check to prevent concurrent-edit overwrites on SOW drafts
- **Soft deletes:** `deleted_at` on Clients, Projects, and Templates to preserve referential history
- **Project role assignment UI:** whether Tenant Admins assign project roles individually per project, or via a bulk "add participant to N projects with role X" flow
