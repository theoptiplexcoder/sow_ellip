## PRODUCT GOAL
The product goal is deliberately narrow: let any number of separate organizations each create structured SOWs, assign a configurable sequential approval workflow, move the SOW through approve / reject / request changes, export a print-ready PDF, and review an audit trail — **with each organization's data fully isolated from every other organization's.** This reflects how work statements are used in practice: the work statement must clearly describe the work, period of performance, deliverable schedule, and related performance requirements, so the MVP focuses on structured capture of exactly those items rather than on a generic rich-text editor or a full contract-lifecycle platform. It is explicitly a **multi-tenant SaaS** product, not a single-org internal tool — tenant isolation is a day-one requirement, not a later hardening pass.

## APPLICATION FLOW
Prospective customer signs up → their **Organization** is created and they become that org's Admin → they invite teammates (Creator/Approver/Viewer roles) → the org's users create clients, projects, templates, and workflows scoped only to that org → SOWs move through drafting, submission, sequential approval, and export, visible only to members of that organization.

## USER PERSONAS

1. SUPER ADMIN — a single platform-level persona, seeded at deploy time (not self-registered, not invited); reviews and approves/rejects organization signup requests; has **no visibility into any organization's tenant data** (clients, projects, SOWs, templates, workflows, audit logs) — its access is limited to signup-request metadata and the org/admin identity fields needed to decide approval
2. ORGANIZATION ADMIN — an org-wide role (`User.role = ADMIN`), created only once a Super Admin approves that org's signup request; invites/manages users for their own organization only. Templates and workflows remain org-scoped resources any org member can create; per-project capability (Creator/Approver/Viewer, below) is separate from this role.
3. ORG MEMBER — every other user in an organization (`User.role = MEMBER`); a Member's capabilities are entirely determined **per project** by that project's role assignment (below), not by a single global role.

### Project-level roles (new)
Within an organization, each user is assigned **one role per project** — `CREATOR`, `APPROVER`, or `VIEWER` — rather than one role for the whole org. The same person can be `CREATOR` on Project 1, `APPROVER` on Project 2, and `VIEWER` on Project 3, all at once.

- **CREATOR** — the project's admin. Automatically assigned to whoever creates the project (its owner); can create/edit clients-linked SOW drafts and templates usage on that project, build/attach workflows to its SOWs, and assign `APPROVER`/`VIEWER` roles to other org members on that specific project.
- **APPROVER** — can act (approve / reject / request changes) only on approval steps assigned to them on SOWs belonging to that project; view audit logs for that project.
- **VIEWER** — read-only: can view the project's clients, SOWs, and audit logs, but cannot create, edit, or act on approvals. **This is also the default** for any org member who has no explicit role assigned on a given project — every org member can at least view every project in their own organization unless elevated to `CREATOR`/`APPROVER`.

There is no persona (other than Super Admin) that spans multiple organizations in the MVP. The Super Admin is deliberately kept outside the tenant model entirely rather than given an "all-org" view of tenant data.

## SIGNUP (Organization Signup Request)
1. A prospective customer signs up by providing: organization name, organization slug (used for tenant-aware links; must be unique platform-wide), their own name, email, phone, and password.
2. This action does **not** immediately provision an `Organization`. It creates the Supabase Auth credential (email/password) plus an `OrganizationSignupRequest` row in status `PENDING` — no `organization_id` claim is set yet, so the account cannot access any org-scoped screen or API.
3. A Super Admin reviews the request:
   - **Approve** → provisions the `Organization` row, sets `app_metadata.organization_id` on the existing auth user, creates their `public.users` row as `ADMIN`, and marks the request `APPROVED`.
   - **Reject** → marks the request `REJECTED`; the auth credential is retained (for audit) but never gains an `organization_id` claim, so it can never log into any org.
4. All subsequent users for an approved organization are still **invited** by an existing Admin (via Users management), not self-registered — this prevents an arbitrary signer-upper from landing in someone else's org by guessing an invite-less flow.

## LOGIN
1. A single login page with email and password (OTP deferred to backlog) for organization users. Super Admin logs in through a separate, unlisted login path with its own credential set.
2. All organization users, across all organizations, log in through the same page; which organization's data they see is determined entirely server-side by their account's organization membership, never by anything the client sends.
3. A user whose signup request is still `PENDING` or was `REJECTED` gets a clear "awaiting approval" / "not approved" message on login attempt, not a generic auth error.

## SUPER ADMIN CONSOLE
*(entirely separate from the org dashboard below; not scoped to any organization)*

1. SUPER ADMIN
   View queue of organization signup requests (Pending / Approved / Rejected), inspect a request's org name, slug, and admin identity fields, approve or reject a request. No access to any organization's clients, projects, templates, workflows, SOWs, users, or audit logs — approval is an identity/legitimacy decision, not an operational one.

## DASHBOARD
*(all lists and actions below are implicitly scoped to the logged-in user's own organization; capabilities below the Org Admin row are further scoped **per project** — see Project-level roles above)*

1. ORG ADMIN (`User.role = ADMIN`)
   Invite/deactivate users, create/edit clients and projects, create/edit templates, view audit logs across all of the org's projects — **for their organization only.** Does not itself grant `CREATOR`/`APPROVER` capability on any specific project; an Admin who wants to create/edit SOWs or approve on a project still needs (or is granted, as project owner) a `ProjectRole` on that project, same as any other member.

2. CREATOR (project role)
   Create/edit SOW drafts, submit SOWs, build and attach workflows — **only on projects where this user holds the `CREATOR` role** (always true for the project's owner). View audit logs for that project.

3. APPROVER (project role)
   Approve, reject, request changes — **only on approval steps assigned to them on SOWs belonging to a project where they hold the `APPROVER` role.** A user can never be assigned as approver on a workflow step whose SOW belongs to a project where they don't hold `APPROVER` (validated at submit time — see `schema.md`), or on any project outside their own organization.

4. VIEWER (project role, and the default)
   View SOWs and audit logs for a project — **either because explicitly assigned `VIEWER`, or by default when no explicit `ProjectRole` row exists for that user on that project.**

## Features and considerations by capability area
- **Organizations (new)** — provisioned only on Super Admin approval of a signup request; slug uniqueness checked at request time; no self-serve deletion in MVP.
- **Organization signup requests (new)** — created at signup; hold org + admin details pending review; approve/reject by Super Admin only; a request's `organizationSlug`/`adminEmail` uniqueness check spans both existing organizations and other pending requests, so two people can't both claim the same slug while awaiting review.
- **Super Admin (new)** — single seeded platform account (not stored as an org `User`); reviews signup requests only; every approve/reject is audit-logged.
- **Auth** — Login, logout, current-user session (includes organization ID), protected routes, session expiry, seeded demo users **across at least two separate demo organizations** so isolation can be demonstrated.
- **Users and RBAC** — Admin can list users, create user, deactivate user, assign the org-wide `ADMIN`/`MEMBER` role — **scoped to the admin's own organization**; authorization on every mutation checks both org membership and, for project-scoped actions, the caller's `ProjectRole` on the project in question.
- **Clients** — Create, edit, list, view details, soft delete optional — scoped per organization.
- **Projects** — Create, edit, list, link to client, owner, status; portfolio planning — client and owner must belong to the same organization as the project. Creating a project auto-assigns its owner the `CREATOR` project role.
- **Project membership & roles (new)** — the project's `CREATOR` (or an org Admin) assigns/updates a `ProjectRole` (`CREATOR`/`APPROVER`/`VIEWER`) per user per project; one role per user per project (reassigning replaces, never adds, a role); a user with no explicit row defaults to `VIEWER` on that project.
- **Templates** — Create blank template, edit default section text, duplicate, activate/deactivate — scoped per organization; names unique per org, not globally.
- **SOW builder** — Create draft, edit sections, add deliverables and milestones, save draft, preview — SOW numbers unique per organization; only users holding `CREATOR` (or default-`VIEWER`-excluded) role on the SOW's project may create/edit.
- **Workflow builder** — Create named workflow, define ordered steps, assign approvers (same org) — since a workflow is a reusable, org-scoped template not tied to one project, each step's approver's `APPROVER`/`CREATOR` `ProjectRole` is validated against the SOW's actual project at submit time, not at workflow save time.
- **Approvals** — Pending queue, step detail, approve/reject/request changes, mandatory comment on rejection/change request — queue is implicitly scoped to the approver's own organization **and** to projects where they hold the `APPROVER` role.
- **PDF export** — Print-ready page with branded layout and browser Save as PDF; page re-checks the requester's organization matches the SOW's before rendering.
- **Audit logs** — Append-only event entries for all state-changing actions, each entry tagged with the organization it belongs to.

## AUDIT LOGS
- ORGANIZATION_SIGNUP_REQUESTED
- ORGANIZATION_APPROVED
- ORGANIZATION_REJECTED
- ORGANIZATION_CREATED
- USER_LOGGED_IN
- USER_INVITED
- CLIENT_CREATED / UPDATED
- PROJECT_CREATED / UPDATED
- PROJECT_MEMBER_ROLE_ASSIGNED
- TEMPLATE_CREATED / UPDATED
- SOW_CREATED / UPDATED
- SOW_SUBMITTED
- APPROVAL_APPROVED
- APPROVAL_REJECTED
- APPROVAL_CHANGES_REQUESTED
- SOW_PRINT_VIEW_OPENED
- SOW_EXPORTED_TO_PDF

Every tenant `AuditLog` entry carries the acting user's `organization_id`, so audit queries never need to reason about cross-org leakage. `ORGANIZATION_SIGNUP_REQUESTED`/`_APPROVED`/`_REJECTED` are the exception: they happen before an `Organization` row necessarily exists, so they're recorded in a separate, non-tenant `SuperAdminAuditLog` (see `schema.md`) rather than forcing a nullable `organization_id` onto the tenant-scoped table.

## NON-FUNCTIONAL: TENANT ISOLATION
- No query path may return rows from a different organization, under any role, including Admin. The Super Admin persona does **not** break this: it has no query path into any tenant-scoped table (clients, projects, templates, workflows, sows, and their children, `AuditLog`) — only into `OrganizationSignupRequest`, its own `SuperAdminAuditLog`, and the non-sensitive identity columns (`name`, `slug`) needed to list approved organizations.
- Direct object reference to another organization's resource (e.g. guessing a SOW ID) must return **404**, not 403, to avoid confirming existence.
- Isolation is enforced at the database layer via Postgres Row Level Security, not only in application code, and is covered by an explicit cross-tenant test suite (see `@/docs/phase_scope.md` → Testing Plan).
- Per-project role checks (`CREATOR`/`APPROVER`/`VIEWER`) are a separate, additional authorization layer *within* an organization's own data — they decide what a member can do on a given project, not whether they can see another org's data. RLS and cross-tenant isolation hold regardless of any user's project roles.
