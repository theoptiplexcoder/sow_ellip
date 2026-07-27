# Application Flow

## Signup → Organization Creation
1. A prospective customer signs up by providing: organization name, organization slug (unique platform-wide, used for tenant-aware links), their own name, email, phone, and password.
2. This single action provisions a new `Organization` row and makes the signing-up user its `ADMIN` — there's no path to register as a standalone user with no org attached.
3. All subsequent users for that org are **invited** by an existing Admin via Users management, not self-registered. This closes off an arbitrary signer-upper landing in someone else's org.

## Login
1. A single login page with email and password (OTP deferred to backlog).
2. All users, across all organizations, log in through the same page. Which organization's data they see is determined entirely server-side by their account's organization membership — never by anything the client sends.

## Core User Journey
```
Sign up (creates Organization + Admin user)
  → Invite teammates (Creator / Approver / Viewer)
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
- Signup form (org name, slug, admin details, password)
- Login form (email, password)

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

**Templates**
- List / create / edit / duplicate / archive; default section text for overview/objectives/scope/assumptions/terms

**Workflows**
- List / create / edit; ordered steps, assigned approver per step (must be same org); reorder; activate

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
| Organization Admin | Invite/manage users, roles, templates, workflows — own org only |
| SOW Creator | Create clients/projects, draft & submit SOWs, build workflows, view audit logs |
| Approver | Approve, reject, request changes on assigned steps, view audit logs |
| Executive Viewer | View dashboard, SOWs, audit history |

## Cross-Tenant Behavior (what should visibly happen)
- A user never sees another organization's clients, projects, templates, workflows, SOWs, or audit entries in any list.
- Navigating directly to another org's resource by ID/URL returns a 404 (not a permission error) — same as if it never existed.
- An Admin has no "view all organizations" mode; there is no super-admin persona in the MVP.
