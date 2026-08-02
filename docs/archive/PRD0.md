Product Requirements Document: Statement of Work (SOW) Platform
Status: MVP Specification Document version: 1.0

1. Vision
   Build a deployable, small-team MVP for a multi-tenant Statement of Work (SOW) platform: structured SOW authoring, configurable sequential approval workflows, audit trail, and print-ready output — deliberately scoped below a full Contract Lifecycle Management (CLM) platform.

The product focuses on exactly what a work statement needs to describe: the work, period of performance, deliverable schedule, and performance requirements — captured as structured data rather than free-form rich text.

Target scale for MVP (first 6–12 months): 10–50 tenants.

2. Architecture Overview
   Layer Choice Notes
   Application Next.js (App Router), Nx monorepo, TypeScript Deployed on Vercel
   Database Supabase Postgres Pooled connections (transaction mode) for app queries; direct connection reserved for migrations
   Auth Better Auth Session-based, protected routes
   File storage Supabase Storage Attachments, uploaded DOCX templates, generated DOCX/PDF outputs
   Background jobs Inngest Durable, retryable multi-step workflows (DOCX pipeline)
   DOCX → PDF conversion Self-hosted LibreOffice (via Gotenberg), deployed on Fly.io/Render Not run on Vercel — LibreOffice requires a persistent container, not a serverless function
   Structured SOW PDF export Print-optimized HTML + browser "Save as PDF" No server-side rendering required for this path
   Why these choices interact the way they do
   Vercel's serverless functions cannot run LibreOffice natively (no persistent binary environment), so DOCX→PDF conversion must live in a separate, always-on container reachable over HTTP.
   Serverless functions open new DB connections per invocation, so connection pooling is mandatory, not optional, at this scale — Supabase's built-in pooler handles this without extra infrastructure.
   The DOCX pipeline (extract placeholders → populate → generate DOCX → convert to PDF → log to audit) is multi-step and each step can fail independently (e.g., the conversion service times out). Inngest provides retryable, durable steps instead of hand-rolled retry logic inside a single request/response cycle.
3. Multi-Tenancy
   Every business table includes a tenant_id. No query may skip tenant scoping — this is enforced at the query-builder/ORM layer, never left to UI filtering alone.

Tenant-scoped tables include:

Users, Clients, Projects, Templates, Template Versions
Workflows, Workflow Versions, Workflow Steps
SOWs, SOW Revisions
Workflow Instances, Workflow Instance Steps
Audit Logs, Attachments 4. Users & Roles
Role Responsibilities
Superadmin Manage tenants, enable/disable tenants, manage tenant admins
Tenant Admin Manage users, roles, templates, workflows, clients/projects for their tenant
Creator Create clients/projects, create/edit SOW drafts, use templates, submit SOWs
Approver Review assigned approvals; approve, reject, request changes; comment
Executive Viewer Read-only dashboard, pipeline visibility, audit history
RBAC
Authorization is permission-based internally rather than hardcoded role checks, so roles remain flexible collections of permissions.

Example permissions:

client:create client:update
project:create template:create
workflow:create workflow:approve
audit:view user:manage
Roles map to permission sets; a role check like if role == Admin should not appear in application logic.

5. Functional Requirements
   5.1 Authentication
   Login / logout
   Current-user session
   Protected routes
   Session expiry
   Seeded demo users
   Library: Better Auth
   5.2 Users & RBAC
   Tenant Admin: list users, create user, deactivate user, assign role
   Authorization enforced on every mutation, not just at the route level
   Superadmin controls tenant-level access (enable/disable tenants and their admins)
   5.3 Clients & Projects
   Creators and Tenant Admins manage Clients and Projects
   Hierarchy: Tenant → Client → Project → SOW
   5.4 Templates
   Two template concepts, kept clearly separated:

Structured Templates

Created in-app by Tenant Admin
Field/placeholder definitions with default values
Structured SOW data is always the source of truth — a template edit never retroactively changes an already-generated SOW
DOCX Templates

Tenant Admin uploads a .docx file with placeholders
On upload: store original file → extract placeholders → validate → persist placeholder definitions → associate with a template version
Template versioning: a generated SOW stores which template version it came from, not a live link to the current template
5.5 SOW Builder
Create draft, save draft, preview, generate from template, edit structured sections
Recommended structured sections:

Title Objectives
Client Scope
Project Deliverables
Background Milestones
Period of Performance Performance Requirements
Acceptance Criteria Assumptions
Dependencies Risks
Pricing (optional)
5.6 SOW Revisions
Every submission is an immutable revision: SOW → Revision 1 → Revision 2 → Revision 3 …
"Request Changes" produces a new revision rather than editing history in place
Each revision retains its own submission date, workflow instance, approval history, and generated outputs
5.7 Workflow Builder
Tenant Admin creates named, reusable workflows
Unlimited ordered steps, drag/button reorder, assign users per step
Activate / deactivate / archive workflows tenant-wide
Model: Workflow → Workflow Version → Workflow Steps
Editing a workflow definition never affects in-flight approvals — new submissions use the latest active version; approvals already underway continue on the version they started with
5.8 Workflow Execution
Workflow Definition → Workflow Version → Workflow Instance → Workflow Instance Steps
Actions per step: Approve / Reject / Request Changes
Comments mandatory on Reject and Request Changes
State transitions are system-driven — never manually edited by a user
5.9 SOW State Machine
Draft → Submitted → In Review → Approved
In Review → Rejected
In Review → Changes Requested → (new revision) → Draft → Submitted
Approved → Archived
Only these transitions are permitted; the application enforces this rather than trusting client input.

5.10 Document Generation Pipeline (Inngest-orchestrated)
Triggered on SOW approval or export request:

Extract — read structured SOW revision data
Populate — fill DOCX placeholders (if a DOCX template is attached) using the structured data
Generate DOCX — produce the filled .docx, store in Supabase Storage
Convert to PDF — call the self-hosted LibreOffice/Gotenberg service over HTTP with the generated DOCX; store resulting PDF in Supabase Storage
Audit log — record each step's completion/failure with metadata
Each step is independently retryable; a failure at step 4 (e.g., conversion service timeout) does not require re-running steps 1–3.

Separate, always-on path: the structured SOW itself can always be exported via the print-optimized HTML page (/sows/[id]/print) and the browser's native "Save as PDF" — this path has no dependency on Inngest or the conversion service and should remain available even if the DOCX pipeline is degraded.

5.11 Audit Log
Append-only. Every state-changing action creates an immutable entry.

Captured events include: SOW created, draft updated, submitted, workflow attached, step approved/rejected, changes requested, workflow completed, template updated, user role changed, client/project changes.

Fields:

tenant_id actor_id entity_type
entity_id action previous_state
new_state timestamp metadata (JSONB)
5.12 Dashboard (role-tailored)
Role Views
Creator My Drafts, Submitted, Returned for Changes, Recently Updated
Approver Pending Approval, Approved Today, Rejected Today
Tenant Admin Active Users, Active Workflows, Status Summary, Recent Activity
Executive Viewer Pipeline by Status, Blocked SOWs, Average Approval Time, Audit History
Superadmin Total Tenants, Active Tenants, Disabled Tenants, Total Users 6. Database Modules
core tenants, users, roles, permissions
crm clients, projects
templates templates, template_versions
sow sows, sow_revisions
workflow workflows, workflow_versions, workflow_steps,
workflow_instances, workflow_instance_steps
audit audit_logs
storage attachments 7. Nx Monorepo Structure
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
shared/ 8. External Services Summary
Service Purpose Deployment
Supabase Postgres + connection pooling + object storage Managed
Better Auth Authentication In-app (Next.js)
Inngest Durable background job orchestration Managed (webhook-triggered from Vercel)
LibreOffice / Gotenberg DOCX → PDF conversion Self-hosted container on Fly.io or Render 9. Design Principles
PostgreSQL (via Supabase) is the single source of persistence.
Structured SOW data is the canonical source of truth — DOCX is an import/export and presentation format, never the primary editing surface.
HTML print → browser PDF remains available independent of the DOCX/Inngest pipeline.
Workflow definitions are reusable and versioned; workflow instances are immutable once started.
SOW revisions preserve every historical submission.
Audit logs are append-only.
Authorization is permission-based, not role-string-based.
Every query is tenant-aware; no cross-tenant access is possible even by omission.
The MVP scope is deliberately SOW-focused, not a CLM platform. 10. Explicitly Out of Scope for MVP
AI-generated SOWs
Email/Slack/Teams notifications
Digital/e-signatures
OCR, contract comparison
Real-time collaboration
External (non-authenticated) approval links
Elasticsearch-based search (basic ILIKE search is sufficient at this scale) 11. Open Decisions (not yet locked, non-blocking for architecture)
These don't change the core architecture above but should be decided before or during early build:

Tenant onboarding: self-serve signup vs. Superadmin-provisioned only
Notifications: confirm fully deferred to v2, including in-app notification badges
Testing strategy: unit + integration coverage baseline; recommend Playwright end-to-end coverage specifically for the approval workflow, given it's the highest-risk business logic
Observability: Vercel's built-in logging plus an error tracker (e.g., Sentry) so failures inside Inngest steps and the conversion service are visible, not silent
Optimistic locking: version/updated_at check to prevent concurrent-edit overwrites on SOW drafts
Soft deletes: deleted_at on Clients, Projects, and Templates to preserve referential history
